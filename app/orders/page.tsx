"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { CustomerMobileNav } from "@/components/layout/CustomerMobileNav";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  status: string;
  scheduling_type: string;
  delivery_address: string;
  delivery_city: string;
  total_price: number;
  created_at: string;
};

type FilterKey = "all" | "delivered" | "in_transit" | "cancelled";
type DateRange = "all" | "7d" | "30d" | "90d";

const RANGE_DAYS: Record<DateRange, number | null> = { all: null, "7d": 7, "30d": 30, "90d": 90 };
const RANGE_LABEL: Record<DateRange, string> = {
  all: "All time",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

function statusClass(status: string) {
  const map: Record<string, string> = {
    delivered: "text-emerald-600 bg-emerald-50 border border-emerald-100",
    cancelled: "text-slate-600 bg-slate-50 border border-slate-200",
    in_transit: "text-blue-600 bg-blue-50 border border-blue-100",
    picked_up: "text-blue-600 bg-blue-50 border border-blue-100",
    confirmed: "text-primary bg-primary/5 border border-primary/20",
    pending: "text-amber-600 bg-amber-50 border border-amber-100",
  };
  return map[status] ?? "text-slate-600 bg-slate-50 border border-slate-200";
}

function formatStatus(status: string) {
  return status.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function applyFilters(orders: Order[], filter: FilterKey, range: DateRange): Order[] {
  let out = orders;
  if (filter === "delivered") out = out.filter((o) => o.status === "delivered");
  else if (filter === "in_transit") out = out.filter((o) => o.status === "in_transit" || o.status === "picked_up");
  else if (filter === "cancelled") out = out.filter((o) => o.status === "cancelled");

  const days = RANGE_DAYS[range];
  if (days != null) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    out = out.filter((o) => new Date(o.created_at).getTime() >= cutoff);
  }
  return out;
}

export default function OrderHistoryPage() {
  const user = useCustomerAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Close the date-range dropdown on outside click or Escape
  useEffect(() => {
    if (!rangeOpen) return;
    function onDown(e: MouseEvent) {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) setRangeOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setRangeOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [rangeOpen]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("delivery_orders")
      .select("id, status, scheduling_type, delivery_address, delivery_city, total_price, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError("Couldn't load your orders. Please try refreshing.");
        } else {
          setOrders(data ?? []);
        }
        setLoading(false);
      });
  }, [user]);

  if (!user) return null;

  const displayId = (id: string) => `EQ-${id.slice(0, 6).toUpperCase()}`;
  const displayMeta = (type: string) =>
    type === "instant" ? "Instant Delivery" : "Scheduled Delivery";

  const filteredOrders = applyFilters(orders, activeFilter, dateRange);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All orders" },
    { key: "delivered", label: "Delivered" },
    { key: "in_transit", label: "In transit" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="page-fade min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-[#050507] dark:text-[#ede9f8]">
      <CustomerTopBar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10 sm:px-6 lg:py-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              Activity
            </p>
            <h1 className="mb-3 text-3xl tracking-tight text-primary sm:text-4xl md:text-5xl">
              ORDER HISTORY
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {orders.length} total order{orders.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-1 py-1 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur dark:border-[#221d38] dark:bg-[#0c0b14]/80 dark:text-zinc-400">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={[
                    "rounded-full px-4 py-1.5 transition-colors active:scale-95",
                    activeFilter === f.key
                      ? "bg-primary text-white shadow-sm"
                      : "hover:bg-slate-50 dark:hover:bg-[#1e1538]",
                  ].join(" ")}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Date-range dropdown */}
            <div ref={rangeRef} className="relative">
              <button
                type="button"
                onClick={() => setRangeOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={rangeOpen}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-[7px] text-[11px] font-semibold shadow-sm backdrop-blur transition-colors active:scale-95",
                  dateRange !== "all"
                    ? "border-primary/30 bg-primary/5 text-primary dark:border-[#c084fc]/30 dark:bg-[#c084fc]/10 dark:text-[#c084fc]"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-50 dark:border-[#221d38] dark:bg-[#0c0b14]/80 dark:text-zinc-400 dark:hover:bg-[#1e1538]",
                ].join(" ")}
              >
                {RANGE_LABEL[dateRange]}
                <span className={`material-symbols-outlined text-sm transition-transform ${rangeOpen ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>

              {rangeOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 text-[12px] font-semibold text-slate-600 shadow-lg dark:border-[#221d38] dark:bg-[#0c0b14] dark:text-zinc-300"
                >
                  {(Object.keys(RANGE_LABEL) as DateRange[]).map((key) => (
                    <li key={key}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={dateRange === key}
                        onClick={() => {
                          setDateRange(key);
                          setRangeOpen(false);
                        }}
                        className={[
                          "flex w-full items-center justify-between px-4 py-2 text-left transition-colors",
                          dateRange === key
                            ? "bg-primary/5 text-primary dark:bg-[#c084fc]/10 dark:text-[#c084fc]"
                            : "hover:bg-slate-50 dark:hover:bg-[#1e1538]",
                        ].join(" ")}
                      >
                        {RANGE_LABEL[key]}
                        {dateRange === key && (
                          <span className="material-symbols-outlined text-sm">check</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined mb-4 animate-spin text-4xl text-primary/30 dark:text-zinc-600">
              progress_activity
            </span>
            <p className="text-sm font-semibold text-slate-400">Loading your orders…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined mb-4 text-5xl text-slate-200 dark:text-zinc-700">
              error_outline
            </span>
            <p className="text-sm font-semibold text-slate-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline"
            >
              Refresh
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined mb-4 text-5xl text-slate-200 dark:text-zinc-700">
              local_shipping
            </span>
            {orders.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-slate-400">No orders yet.</p>
                <Link
                  href="/book/type"
                  className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline"
                >
                  Book your first delivery
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-400">No orders match this filter.</p>
                <button
                  onClick={() => setActiveFilter("all")}
                  className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline"
                >
                  Show all orders
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-[#0c0b14]/90">
                <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50/80 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-zinc-800 dark:bg-[#050507]/80 dark:text-zinc-500">
                  <div className="col-span-2">Order ID</div>
                  <div className="col-span-2">Date &amp; time</div>
                  <div className="col-span-5">Destination</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2 text-right">Price</div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-[#1e1538]">
                  {filteredOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/order/confirmed?id=${order.id}`}
                      className="grid cursor-pointer grid-cols-12 items-center bg-white/80 px-6 py-4 text-sm transition-colors hover:bg-slate-50 dark:bg-[#0c0b14]/80 dark:hover:bg-[#1e1538]"
                    >
                      <div className="col-span-2 font-semibold tracking-tight text-slate-900 dark:text-[#ede9f8]">
                        {displayId(order.id)}
                      </div>
                      <div className="col-span-2 text-sm font-medium text-slate-500">
                        {formatDate(order.created_at)}
                        <span className="block text-[10px] uppercase opacity-50">
                          {formatTime(order.created_at)}
                        </span>
                      </div>
                      <div className="col-span-5 pr-8">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-[#ede9f8]">
                          {order.delivery_address || order.delivery_city || "—"}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-tight text-slate-400">
                          {displayMeta(order.scheduling_type)}
                        </p>
                      </div>
                      <div className="col-span-1">
                        <span
                          className={`px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${statusClass(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3">
                        <span className="font-black text-primary">£{order.total_price.toFixed(2)}</span>
                        {["confirmed", "assigned", "picked_up", "in_transit"].includes(order.status) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/order/track?id=${order.id}`);
                            }}
                            className="text-[9px] font-black uppercase tracking-[0.2em] text-accent hover:underline"
                          >
                            Track
                          </button>
                        )}
                        <span className="material-symbols-outlined text-sm text-slate-300 dark:text-zinc-600">
                          chevron_right
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 dark:border-[#1a1525] dark:bg-[#050507]/60 px-6 py-3 text-[11px] text-slate-500">
                  <span>
                    Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="mt-6 space-y-4 md:hidden">
              {filteredOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/order/confirmed?id=${order.id}`}
                  className="card-hover block rounded-2xl border border-slate-200 bg-white/80 p-4 text-xs shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-[#0c0b14]/80"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-tight text-slate-500">
                        {displayId(order.id)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#ede9f8]">
                        £{order.total_price.toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-[9px] font-black uppercase tracking-[0.22em] ${statusClass(order.status)}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <p className="mb-1 text-xs font-bold text-slate-500">
                    {order.delivery_address || order.delivery_city || "—"}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">
                    {formatDate(order.created_at)} • {formatTime(order.created_at)}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-[#1e1538]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      View details
                    </span>
                    {["confirmed", "assigned", "picked_up", "in_transit"].includes(order.status) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/order/track?id=${order.id}`);
                        }}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-accent hover:underline"
                      >
                        Track →
                      </button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <footer className="mt-10 border-t border-primary/10 pt-4 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
        © 2026 EcoQuick. All rights reserved.
      </footer>
      <CustomerMobileNav />
    </div>
  );
}
