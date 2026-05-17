import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  status: string;
  scheduling_type: string;
  total_price: number;
  created_at: string;
  pickup_city: string | null;
  delivery_city: string | null;
  delivery_address: string | null;
  customer_id: string | null;
  driver_id: string | null;
};

const ACTIVE_STATUSES = ["confirmed", "assigned", "picked_up", "in_transit"];

function statusClass(status: string) {
  const map: Record<string, string> = {
    delivered: "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20",
    cancelled: "text-slate-600 bg-slate-100 border-slate-200 dark:text-zinc-300 dark:bg-zinc-800",
    in_transit: "text-violet-700 bg-violet-50 border-violet-100 dark:text-violet-400 dark:bg-violet-900/20",
    picked_up: "text-indigo-700 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20",
    assigned: "text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/20",
    confirmed: "text-primary bg-primary/5 border-primary/20",
  };
  return `border ${map[status] ?? "text-slate-600 bg-slate-50 border-slate-200"}`;
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status ?? "all";
  const query = (params.q ?? "").trim().toLowerCase();

  const service = createServiceClient();
  let req = service
    .from("delivery_orders")
    .select(
      "id, status, scheduling_type, total_price, created_at, pickup_city, delivery_city, delivery_address, customer_id, driver_id"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (statusFilter === "active") {
    req = req.in("status", ACTIVE_STATUSES);
  } else if (statusFilter !== "all") {
    req = req.eq("status", statusFilter);
  }

  const { data } = await req;
  let rows: OrderRow[] = (data as OrderRow[] | null) ?? [];

  if (query) {
    rows = rows.filter(
      (r) =>
        r.id.toLowerCase().includes(query) ||
        (r.delivery_city ?? "").toLowerCase().includes(query) ||
        (r.delivery_address ?? "").toLowerCase().includes(query) ||
        (r.pickup_city ?? "").toLowerCase().includes(query)
    );
  }

  const filters: { key: string; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "confirmed", label: "Confirmed" },
    { key: "assigned", label: "Assigned" },
    { key: "in_transit", label: "In transit" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Operations
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            ORDERS
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            {rows.length} order{rows.length !== 1 ? "s" : ""}
            {statusFilter !== "all" ? ` · ${formatStatus(statusFilter)}` : ""}
          </p>
        </div>
        <form className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by ID, city, address…"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-[#0c0b14] md:w-80"
          />
          <input type="hidden" name="status" value={statusFilter} />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-[12px] font-bold text-white"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 rounded-full border border-slate-200 bg-white/80 p-1 text-[11px] font-semibold dark:border-zinc-800 dark:bg-[#0c0b14]">
        {filters.map((f) => {
          const isActive = statusFilter === f.key;
          const href =
            f.key === "all" ? "/admin/orders" : `/admin/orders?status=${f.key}`;
          return (
            <Link
              key={f.key}
              href={href}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 py-20 dark:border-zinc-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-zinc-600">
            local_shipping
          </span>
          <p className="text-sm font-semibold text-slate-400">No orders found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-zinc-800 dark:bg-[#050507] dark:text-zinc-500">
                <div className="col-span-2">Order</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-4">Route</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Driver</div>
                <div className="col-span-1 text-right">Price</div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {rows.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="grid grid-cols-12 items-center px-6 py-4 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900"
                  >
                    <div className="col-span-2 font-mono text-[12px] font-semibold text-slate-900 dark:text-[#ede9f8]">
                      EQ-{order.id.slice(0, 6).toUpperCase()}
                    </div>
                    <div className="col-span-2 text-[12px] text-slate-500 dark:text-zinc-400">
                      {formatDate(order.created_at)}
                    </div>
                    <div className="col-span-4 pr-4">
                      <p className="truncate text-[12px] text-slate-700 dark:text-zinc-300">
                        {order.pickup_city ?? "—"} → {order.delivery_city ?? "—"}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] uppercase tracking-tight text-slate-400">
                        {order.scheduling_type}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${statusClass(order.status)}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="col-span-1">
                      {order.driver_id ? (
                        <span className="material-symbols-outlined text-lg text-emerald-500">
                          check_circle
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-widest text-slate-400">
                          —
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 text-right font-bold text-primary">
                      £{Number(order.total_price ?? 0).toFixed(2)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {rows.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#0c0b14]"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[12px] font-bold text-slate-900 dark:text-[#ede9f8]">
                      EQ-{order.id.slice(0, 6).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${statusClass(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-zinc-400">
                  {order.pickup_city ?? "—"} → {order.delivery_city ?? "—"}
                </p>
                <p className="mt-1 font-bold text-primary">
                  £{Number(order.total_price ?? 0).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
