"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerificationActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleAction(action: "approve" | "reject") {
    const reason =
      action === "reject" ? window.prompt("Rejection reason (optional):") : null;
    setBusy(true);
    await fetch("/api/admin/verify-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, reason }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-5 flex gap-3">
      <button
        onClick={() => handleAction("approve")}
        disabled={busy}
        className="rounded-lg bg-emerald-500 px-6 py-2.5 text-[12px] font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "…" : "Approve"}
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={busy}
        className="rounded-lg border border-red-200 px-6 py-2.5 text-[12px] font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
      >
        Reject
      </button>
    </div>
  );
}
