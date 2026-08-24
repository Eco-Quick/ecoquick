"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Surcharge = { id: string; enabled: boolean; amount: number; reason: string | null; updated_at: string };

export function SurchargeToggle({ surcharge }: { surcharge: Surcharge }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(surcharge.enabled);
  const [amount, setAmount] = useState(surcharge.amount.toFixed(2));
  const [reason, setReason] = useState(surcharge.reason ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const dirty =
    enabled !== surcharge.enabled ||
    amount !== surcharge.amount.toFixed(2) ||
    reason !== (surcharge.reason ?? "");

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const price = Number(amount);
    if (!Number.isFinite(price) || price < 0) {
      setMessage("Enter a valid amount.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/admin/pricing-surcharge", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: surcharge.id, enabled, amount: price, reason }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setMessage(json.error ?? "Failed to save surcharge.");
      return;
    }

    setMessage(enabled ? `Active — £${price.toFixed(2)} added to every new booking.` : "Turned off.");
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Surcharge</h2>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-zinc-400">
            Flat amount added on top of every new booking — e.g. for bad weather.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled((e) => !e)}
          aria-pressed={enabled}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-amber-500" : "bg-slate-200 dark:bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">
              £
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-6 pr-3 text-sm font-bold text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 dark:border-zinc-700 dark:bg-[#050507] dark:text-[#ede9f8]"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            Reason shown to customers (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Bad weather surcharge"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 dark:border-zinc-700 dark:bg-[#050507] dark:text-[#ede9f8]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        {message && <p className="text-[12px] font-medium text-slate-500 dark:text-zinc-400">{message}</p>}
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="ml-auto rounded-lg bg-amber-500 px-6 py-2.5 text-[12px] font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
