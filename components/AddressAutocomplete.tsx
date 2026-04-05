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

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter address",
  className = "",
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setPredictions(data.predictions ?? []);
        setOpen((data.predictions ?? []).length > 0);
        setHighlighted(-1);
      } catch {
        setPredictions([]);
        setOpen(false);
      } finally {
        setLoading(false);
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
      select(predictions[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function select(p: Prediction) {
    onChange(p.description);
    onSelect(p);
    setOpen(false);
    setHighlighted(-1);
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
          className="absolute z-50 mt-1 w-full overflow-hidden border border-primary/20 bg-white dark:bg-[#161027] shadow-[0_8px_24px_rgba(62,0,116,0.15)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
        >
          {predictions.map((p, i) => (
            <button
              key={p.place_id}
              type="button"
              onMouseDown={() => select(p)}
              className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 transition-colors ${
                i === highlighted ? "bg-primary/5" : "hover:bg-primary/5"
              }`}
            >
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-sm text-accent">
                location_on
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
          <div className="bg-slate-50 dark:bg-[#0d0916] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Powered by Mapbox
          </div>
        </div>
      )}

      {open && !loading && predictions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full border border-primary/20 bg-white dark:bg-[#161027] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 shadow-lg">
          No addresses found — try being more specific
        </div>
      )}
    </div>
  );
}
