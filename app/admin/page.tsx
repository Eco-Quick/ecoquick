import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type StatusCounts = Record<string, number>;

const ACTIVE_STATUSES = ["confirmed", "assigned", "picked_up", "in_transit"];

async function getKpis() {
  const service = createServiceClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    ordersAll,
    ordersToday,
    drivers,
    pendingVerifications,
  ] = await Promise.all([
    service.from("delivery_orders").select("status, total_price, created_at"),
    service
      .from("delivery_orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),
    service.from("driver_profiles").select("is_online"),
    service
      .from("user_verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const rows = ordersAll.data ?? [];
  const statusCounts: StatusCounts = {};
  let revenue = 0;
  let activeOrders = 0;

  for (const row of rows) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    if (row.status === "delivered") revenue += Number(row.total_price ?? 0);
    if (ACTIVE_STATUSES.includes(row.status)) activeOrders += 1;
  }

  const driversOnline = (drivers.data ?? []).filter((d) => d.is_online).length;

  return {
    totalOrders: rows.length,
    ordersToday: ordersToday.count ?? 0,
    activeOrders,
    revenue,
    driversTotal: drivers.data?.length ?? 0,
    driversOnline,
    pendingVerifications: pendingVerifications.count ?? 0,
    statusCounts,
  };
}

function Kpi({
  label,
  value,
  icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "primary" | "emerald" | "amber" | "blue";
  href?: string;
}) {
  const toneMap = {
    primary: "text-primary bg-primary/10",
    emerald: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
    amber: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20",
    blue: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  };

  const body = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-[#0c0b14]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
          {label}
        </p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneMap[tone]}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#ede9f8]">
        {value}
      </p>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function AdminDashboardPage() {
  const kpi = await getKpis();

  const breakdown = [
    { key: "confirmed", label: "Confirmed", color: "bg-primary" },
    { key: "assigned", label: "Assigned", color: "bg-blue-500" },
    { key: "picked_up", label: "Picked up", color: "bg-indigo-500" },
    { key: "in_transit", label: "In transit", color: "bg-violet-500" },
    { key: "delivered", label: "Delivered", color: "bg-emerald-500" },
    { key: "cancelled", label: "Cancelled", color: "bg-zinc-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Overview
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          ADMIN DASHBOARD
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Total revenue"
          value={`£${kpi.revenue.toFixed(2)}`}
          icon="payments"
          tone="emerald"
        />
        <Kpi
          label="Orders today"
          value={String(kpi.ordersToday)}
          icon="today"
          tone="primary"
          href="/admin/orders"
        />
        <Kpi
          label="Active orders"
          value={String(kpi.activeOrders)}
          icon="local_shipping"
          tone="blue"
          href="/admin/orders?status=active"
        />
        <Kpi
          label="Drivers online"
          value={`${kpi.driversOnline} / ${kpi.driversTotal}`}
          icon="directions_car"
          tone="primary"
          href="/admin/drivers"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Total orders"
          value={String(kpi.totalOrders)}
          icon="receipt_long"
          tone="primary"
        />
        <Kpi
          label="Pending verifications"
          value={String(kpi.pendingVerifications)}
          icon="verified_user"
          tone="amber"
          href="/admin/verifications"
        />
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#0c0b14]">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-primary">
          Order status breakdown
        </h2>
        <div className="space-y-3">
          {breakdown.map((b) => {
            const count = kpi.statusCounts[b.key] ?? 0;
            const pct = kpi.totalOrders === 0 ? 0 : (count / kpi.totalOrders) * 100;
            return (
              <div key={b.key}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">
                    {b.label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-[#ede9f8]">
                    {count}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${b.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
