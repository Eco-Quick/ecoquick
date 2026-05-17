"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleCancel() {
    const reason = window.prompt("Cancellation reason (optional):") ?? "";
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;

    setBusy(true);
    const res = await fetch("/api/admin/cancel-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reason }),
    });
    setBusy(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to cancel" }));
      window.alert(err.error ?? "Failed to cancel order");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleCancel}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-red-600 transition-all hover:bg-red-50 active:scale-95 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <span className="material-symbols-outlined text-base">cancel</span>
      {busy ? "Cancelling…" : "Cancel order"}
    </button>
  );
}
