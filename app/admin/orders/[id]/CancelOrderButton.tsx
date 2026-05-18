"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isPaid = paymentStatus === "paid";

  async function handleCancel() {
    const reason = window.prompt("Cancellation reason (optional):") ?? "";
    const confirmMsg = isPaid
      ? "Cancel this order? The customer's card will be refunded automatically."
      : "Cancel this order? This cannot be undone.";
    if (!window.confirm(confirmMsg)) return;

    setBusy(true);
    const res = await fetch("/api/admin/cancel-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reason }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      window.alert(json.error ?? "Failed to cancel order");
      return;
    }

    if (json.refund?.refunded) {
      window.alert(`Order cancelled. £${json.refund.amount.toFixed(2)} refunded to the customer's card.`);
    } else if (isPaid) {
      window.alert(
        `Order cancelled, but the automatic refund did not complete: ${json.refund?.reason ?? "unknown"}.\n\nIssue the refund manually in the Stripe dashboard.`
      );
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
      {busy ? "Cancelling…" : isPaid ? "Cancel & refund" : "Cancel order"}
    </button>
  );
}
