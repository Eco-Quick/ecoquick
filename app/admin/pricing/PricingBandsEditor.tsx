"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Band = {
  id: string;
  label: string;
  up_to_miles: number;
  price: number;
};

export function PricingBandsEditor({ bands }: { bands: Band[] }) {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(bands.map((b) => [b.id, b.price.toFixed(2)]))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const dirty = bands.some((b) => prices[b.id] !== b.price.toFixed(2));

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const payload = bands.map((b) => ({ id: b.id, price: Number(prices[b.id]) }));
    if (payload.some((p) => !Number.isFinite(p.price) || p.price < 0)) {
      setMessage("Every band needs a valid, non-negative price.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/admin/pricing-bands", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bands: payload }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setMessage(json.error ?? "Failed to save pricing.");
      return;
    }

    setMessage("Saved — new bookings will use these prices immediately.");
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
      <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-zinc-800 dark:bg-[#050507] dark:text-zinc-500">
        <div className="col-span-6">Distance band</div>
        <div className="col-span-3">Up to</div>
        <div className="col-span-3 text-right">Price</div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-zinc-800">
        {bands.map((b) => (
          <div key={b.id} className="grid grid-cols-12 items-center px-6 py-4">
            <div className="col-span-6 text-sm font-semibold text-slate-700 dark:text-zinc-300">
              {b.label}
            </div>
            <div className="col-span-3 text-[13px] text-slate-400">
              {b.up_to_miles} mi{b.up_to_miles > 1 ? "s" : ""}
            </div>
            <div className="col-span-3">
              <div className="relative ml-auto w-28">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">
                  £
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={prices[b.id]}
                  onChange={(e) => setPrices((p) => ({ ...p, [b.id]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-6 pr-3 text-right text-sm font-bold text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 dark:border-zinc-700 dark:bg-[#050507] dark:text-[#ede9f8]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        {message && (
          <p className="text-[12px] font-medium text-slate-500 dark:text-zinc-400">{message}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="ml-auto rounded-lg bg-primary px-6 py-2.5 text-[12px] font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
