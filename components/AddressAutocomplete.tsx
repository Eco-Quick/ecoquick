"use client";

import { useState, useEffect, useRef } from "react";

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
  geometry?: { location: { lat: number; lng: number } };
  postcode: string;
  city: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (prediction: Prediction) => void;
  placeholder?: string;
  className?: string;
}

// Full UK postcode, e.g. "KT2 6DF" — used only to tailor the empty-state hint.
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

function newSessionToken(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "e.g. 12 Acre Road, Kingston",
  className = "",
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  // "os" = full door list from a postcode (Ordnance Survey); "mapbox" = free-text.
  const [source, setSource] = useState<"os" | "mapbox">("mapbox");

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // One Search Box session = N suggest calls + 1 retrieve. Reset after each retrieve.
  const sessionRef = useRef<string>("");
  // Ignore stale suggest responses if the input changed while a request was in flight.
  const reqIdRef = useRef(0);
  // Set right before an onChange caused by selecting a prediction, so the search
  // effect below doesn't treat it as new typing and re-open the dropdown.
  const suppressNextSearchRef = useRef(false);

  if (!sessionRef.current) sessionRef.current = newSessionToken();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }

    if (value.trim().length < 2) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const reqId = ++reqIdRef.current;
      setLoading(true);
      try {
        const query = value.trim();
        let preds: Prediction[] = [];
        let src: "os" | "mapbox" = "mapbox";

        // A full postcode → ask Ordnance Survey for every door at that postcode.
        if (UK_POSTCODE_REGEX.test(query)) {
          const r = await fetch(`/api/places/postcode?postcode=${encodeURIComponent(query)}`);
          const d: { predictions?: Prediction[] } = await r.json();
          if ((d.predictions ?? []).length > 0) {
            preds = d.predictions ?? [];
            src = "os";
          }
        }

        // Free-text (or no OS key / no OS match) → Mapbox Search Box suggest.
        if (preds.length === 0) {
          const r = await fetch(
            `/api/places/autocomplete?input=${encodeURIComponent(value)}&session_token=${encodeURIComponent(sessionRef.current)}`
          );
          const d: { predictions?: Prediction[] } = await r.json();
          preds = d.predictions ?? [];
          src = "mapbox";
        }

        if (reqId !== reqIdRef.current) return; // a newer query superseded this one
        setSource(src);
        setPredictions(preds);
        setOpen(preds.length > 0);
        setHighlighted(-1);
      } catch {
        if (reqId === reqIdRef.current) {
          setPredictions([]);
          setOpen(false);
        }
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        listRef.current?.contains(e.target as Node) ||
        inputRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || predictions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h < predictions.length - 1 ? h + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h > 0 ? h - 1 : predictions.length - 1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      void select(predictions[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  async function select(p: Prediction) {
    suppressNextSearchRef.current = true;
    onChange(p.description);
    setOpen(false);
    setHighlighted(-1);
    setPredictions([]);

    // OS Places results already include precise coordinates — use them directly.
    if (p.geometry) {
      onSelect(p);
      return;
    }

    setLoading(true);
    try {
      // Mapbox suggestion: resolve precise coordinates + authoritative postcode/city.
      const res = await fetch(
        `/api/places/retrieve?id=${encodeURIComponent(p.place_id)}&session_token=${encodeURIComponent(sessionRef.current)}`
      );
      const data: { result?: Prediction } = await res.json();
      const r = data.result;
      onSelect({
        ...p,
        description: r?.description || p.description,
        postcode: r?.postcode || p.postcode,
        city: r?.city || p.city,
        geometry: r?.geometry ?? p.geometry,
      });
      if (r?.description) {
        suppressNextSearchRef.current = true;
        onChange(r.description);
      }
    } catch {
      // Fall back to suggest-level data (no precise coordinates).
      onSelect(p);
    } finally {
      setLoading(false);
      // Selection closes the Search Box session — start a fresh one for the next search.
      sessionRef.current = newSessionToken();
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-accent">
          <span className="material-symbols-outlined text-base">location_on</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full border border-primary bg-transparent py-3 pl-9 pr-10 text-sm uppercase tracking-wide focus:outline-none ${className}`}
        />
        {loading && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-accent">
            <span className="material-symbols-outlined animate-spin text-base">
              progress_activity
            </span>
          </span>
        )}
      </div>

      {open && predictions.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full overflow-hidden border border-primary/20 bg-white dark:bg-[#0c0b14] shadow-[0_8px_24px_rgba(62,0,116,0.15)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
          style={{ maxHeight: "320px", overflowY: "auto" }}
        >
          {source === "os" && (
            <div className="border-b border-slate-100 dark:border-zinc-800 bg-primary/5 dark:bg-primary/10 px-4 py-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 dark:text-zinc-400">
                {predictions.length} address{predictions.length !== 1 ? "es" : ""} at {value.trim().toUpperCase()}
              </span>
            </div>
          )}
          {predictions.map((p, i) => (
            <button
              key={p.place_id}
              type="button"
              onMouseDown={() => void select(p)}
              className={`flex w-full items-start gap-3 border-b border-slate-100 dark:border-zinc-800 px-4 py-3 text-left last:border-b-0 transition-colors ${
                i === highlighted ? "bg-primary/5" : "hover:bg-primary/5"
              }`}
            >
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-sm text-accent">
                {source === "os" ? "home" : "location_on"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold uppercase tracking-wide text-primary">
                  {p.structured_formatting.main_text}
                </p>
                <p className="truncate text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                  {p.structured_formatting.secondary_text}
                </p>
              </div>
            </button>
          ))}
          <div className="bg-slate-50 dark:bg-[#050507] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {source === "os" ? "UK addresses · Ordnance Survey" : "Powered by Mapbox"}
          </div>
        </div>
      )}

      {open && !loading && predictions.length === 0 && value.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full border border-primary/20 bg-white dark:bg-[#0c0b14] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 shadow-lg">
          {UK_POSTCODE_REGEX.test(value.trim())
            ? "Add a house number + street to find the exact address — e.g. 12 Acre Road"
            : "Keep typing your house number and street name — e.g. 12 Acre Road"}
        </div>
      )}
    </div>
  );
}
