"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DriverOption = {
  id: string;
  full_name: string | null;
  is_online: boolean | null;
  vehicle_type: string | null;
};

export function AssignDriverSelect({
  orderId,
  currentDriverId,
  drivers,
  disabled,
}: {
  orderId: string;
  currentDriverId: string | null;
  drivers: DriverOption[];
  disabled: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentDriverId ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAssign() {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/assign-driver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, driverId: selected }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setMessage(json.error ?? "Failed to assign driver");
      return;
    }
    router.refresh();
  }

  if (disabled) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 dark:border-zinc-700 dark:bg-[#050507] dark:text-zinc-300"
      >
        <option value="">Select a driver…</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.full_name ?? "Unnamed"} — {d.vehicle_type ?? "?"} {d.is_online ? "· online" : "· offline"}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={busy || !selected || selected === currentDriverId}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <span className="material-symbols-outlined text-base">person_add</span>
        {busy ? "Assigning…" : currentDriverId ? "Reassign driver" : "Assign driver"}
      </button>
      {message && <p className="text-[11px] font-medium text-red-500">{message}</p>}
    </div>
  );
}
