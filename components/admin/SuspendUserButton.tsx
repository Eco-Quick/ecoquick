"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SuspendUserButton({
  userId,
  suspended,
  label,
}: {
  userId: string;
  suspended: boolean;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    const action = suspended ? "unsuspend" : "suspend";
    const verb = suspended ? "Unsuspend" : "Suspend";
    if (!window.confirm(`${verb} this ${label}?`)) return;

    setBusy(true);
    const res = await fetch("/api/admin/suspend-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    setBusy(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      window.alert(err.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={
        suspended
          ? "inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-emerald-700 transition-all hover:bg-emerald-50 active:scale-95 disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
          : "inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-red-600 transition-all hover:bg-red-50 active:scale-95 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
      }
    >
      <span className="material-symbols-outlined text-base">
        {suspended ? "check_circle" : "block"}
      </span>
      {busy ? "…" : suspended ? "Unsuspend" : "Suspend"}
    </button>
  );
}
