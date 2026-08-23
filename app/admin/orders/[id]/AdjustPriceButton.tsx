"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdjustPriceButton({
  orderId,
  currentTotal,
}: {
  orderId: string;
  currentTotal: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleAdjust() {
    const input = window.prompt(
      `New total price for this order (currently £${currentTotal.toFixed(2)}):`,
      currentTotal.toFixed(2)
    );
    if (input === null) return;

    const price = Number(input);
    if (!Number.isFinite(price) || price < 0) {
      window.alert("Enter a valid price.");
      return;
    }

    const reason = window.prompt("Reason for this adjustment (optional — e.g. surge, discount):") ?? "";

    setBusy(true);
    const res = await fetch("/api/admin/adjust-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, newTotalPrice: price, reason }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      window.alert(json.error ?? "Failed to update price");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleAdjust}
      disabled={busy}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <span className="material-symbols-outlined text-base">edit</span>
      {busy ? "Saving…" : "Adjust price (surge / discount)"}
    </button>
  );
}
