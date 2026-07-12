"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Activity = {
  key: string; // unique dedupe key
  orderId: string;
  code: string; // EQ-XXXXXX
  kind: "new" | "status";
  status: string;
  at: number;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  assigned: "Assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<string, string> = {
  confirmed: "text-primary",
  assigned: "text-blue-600 dark:text-blue-400",
  picked_up: "text-indigo-600 dark:text-indigo-400",
  in_transit: "text-violet-600 dark:text-violet-400",
  delivered: "text-emerald-600 dark:text-emerald-400",
  cancelled: "text-zinc-500",
  pending: "text-amber-600 dark:text-amber-400",
};

const orderCode = (id: string) => `EQ-${id.slice(0, 6).toUpperCase()}`;
const label = (s: string) => STATUS_LABEL[s] ?? s;

function timeAgo(ts: number) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}

export function AdminActivityBell() {
  const router = useRouter();
  const [items, setItems] = useState<Activity[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Activity[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  // Persist across the dev Strict-Mode mount/remount so seed items aren't duplicated
  const seenRef = useRef<Set<string>>(new Set());

  // Close the dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    const supabase = createClient();
    const seen = seenRef.current;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    function push(a: Activity, toast: boolean) {
      if (seen.has(a.key)) return;
      seen.add(a.key);
      // Guard against duplicate keys even if two pushes race
      setItems((prev) => (prev.some((x) => x.key === a.key) ? prev : [a, ...prev].slice(0, 40)));
      if (toast) {
        setUnread((u) => u + 1);
        setToasts((prev) => (prev.some((x) => x.key === a.key) ? prev : [a, ...prev].slice(0, 4)));
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.key !== a.key)), 6500);
        // Refresh the server-rendered KPIs, throttled to bundle bursts
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => router.refresh(), 1200);
      }
    }

    // Seed the feed with the most recent orders (no toast for these)
    supabase
      .from("delivery_orders")
      .select("id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        (data ?? []).forEach((o) =>
          push(
            {
              key: `seed-${o.id}`,
              orderId: o.id,
              code: orderCode(o.id),
              kind: "status",
              status: o.status,
              at: new Date(o.created_at).getTime(),
            },
            false
          )
        );
        // Mark current statuses as seen so an immediate identical UPDATE isn't re-toasted
        (data ?? []).forEach((o) => seen.add(`${o.id}:${o.status}`));
      });

    const channel = supabase
      .channel("admin-activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "delivery_orders" },
        (payload) => {
          const o = payload.new as { id: string; status: string };
          push(
            { key: `new-${o.id}`, orderId: o.id, code: orderCode(o.id), kind: "new", status: o.status, at: Date.now() },
            true
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "delivery_orders" },
        (payload) => {
          const o = payload.new as { id: string; status: string };
          push(
            { key: `${o.id}:${o.status}`, orderId: o.id, code: orderCode(o.id), kind: "status", status: o.status, at: Date.now() },
            true
          );
        }
      )
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [router]);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next) setUnread(0); // opening the feed clears the badge
      return next;
    });
  }

  return (
    <>
      {/* Bell trigger */}
      <div ref={panelRef} className="relative">
        <button
          type="button"
          onClick={toggle}
          aria-label="Activity"
          aria-expanded={open}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-[#0c0b14] dark:text-zinc-300 dark:hover:bg-zinc-800/60"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-[#0c0b14]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-zinc-800">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Live activity</p>
              <span className="flex h-2 w-2 items-center justify-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-[12px] text-slate-400">No recent activity.</p>
              ) : (
                items.map((a) => (
                  <Link
                    key={a.key}
                    href={`/admin/orders/${a.orderId}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-0 hover:bg-slate-50 dark:border-zinc-900 dark:hover:bg-zinc-800/50"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        a.kind === "new" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500 dark:bg-zinc-800"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {a.kind === "new" ? "add_circle" : "local_shipping"}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-[#ede9f8]">
                        {a.kind === "new" ? "New order booked" : "Order updated"}{" "}
                        <span className="font-mono text-[12px] text-slate-400">{a.code}</span>
                      </p>
                      <p className={`text-[11px] font-medium ${STATUS_TONE[a.status] ?? "text-slate-500"}`}>
                        {label(a.status)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(a.at)}</span>
                  </Link>
                ))
              )}
            </div>
            <Link
              href="/admin/orders"
              onClick={() => setOpen(false)}
              className="block border-t border-slate-100 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              View all orders
            </Link>
          </div>
        )}
      </div>

      {/* Toasts */}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((a) => (
          <Link
            key={a.key}
            href={`/admin/orders/${a.orderId}`}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg transition-transform hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-[#0c0b14]"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                a.kind === "new" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500 dark:bg-zinc-800"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {a.kind === "new" ? "add_circle" : "local_shipping"}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-slate-900 dark:text-[#ede9f8]">
                {a.kind === "new" ? "New order booked" : `Order ${label(a.status).toLowerCase()}`}
              </p>
              <p className="text-[11px] text-slate-400">
                <span className="font-mono">{a.code}</span> · tap to view
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
