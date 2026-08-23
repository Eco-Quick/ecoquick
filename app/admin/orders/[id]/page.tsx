import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { CancelOrderButton } from "./CancelOrderButton";

export const dynamic = "force-dynamic";

type Order = {
  id: string;
  status: string;
  scheduling_type: string;
  customer_id: string | null;
  driver_id: string | null;
  pickup_address: string | null;
  pickup_postcode: string | null;
  pickup_city: string | null;
  sender_name: string | null;
  sender_phone: string | null;
  delivery_address: string | null;
  delivery_postcode: string | null;
  delivery_city: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  product_category: string | null;
  package_size: string | null;
  weight: number | null;
  total_items: number | null;
  driver_instructions: string | null;
  base_price: number | null;
  size_fee: number | null;
  scheduling_fee: number | null;
  discount_amount: number | null;
  total_price: number;
  payment_status: string | null;
  verification_code: string | null;
  created_at: string;
  assigned_at: string | null;
  picked_up_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  needs_van: boolean | null;
};

function formatStatus(s: string) {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    delivered: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
    cancelled: "text-slate-700 bg-slate-100 dark:text-zinc-300 dark:bg-zinc-800",
    in_transit: "text-violet-700 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20",
    picked_up: "text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20",
    assigned: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
    confirmed: "text-primary bg-primary/10",
  };
  return map[status] ?? "text-slate-600 bg-slate-100";
}

const TIMELINE = [
  { key: "created_at", label: "Created" },
  { key: "assigned_at", label: "Assigned" },
  { key: "picked_up_at", label: "Picked up" },
  { key: "in_transit_at", label: "In transit" },
  { key: "delivered_at", label: "Delivered" },
] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = createServiceClient();

  const { data: order } = await service
    .from("delivery_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();
  const o = order as Order;

  let customerEmail: string | null = null;
  let customerName: string | null = null;
  if (o.customer_id) {
    const { data } = await service.auth.admin.getUserById(o.customer_id);
    customerEmail = data?.user?.email ?? null;
    customerName = (data?.user?.user_metadata?.full_name as string) ?? null;
  }

  let driverName: string | null = null;
  let driverPhone: string | null = null;
  if (o.driver_id) {
    const { data: dp } = await service
      .from("driver_profiles")
      .select("full_name, phone")
      .eq("id", o.driver_id)
      .maybeSingle();
    driverName = (dp as { full_name?: string; phone?: string } | null)?.full_name ?? null;
    driverPhone = (dp as { full_name?: string; phone?: string } | null)?.phone ?? null;
  }

  const isCancellable = !["delivered", "cancelled"].includes(o.status);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to orders
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Order detail
          </p>
          <h1 className="font-mono text-3xl font-bold tracking-tight text-primary">
            EQ-{o.id.slice(0, 8).toUpperCase()}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${statusClass(o.status)}`}
            >
              {formatStatus(o.status)}
            </span>
            <span className="rounded bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              {o.scheduling_type}
            </span>
            {o.payment_status && (
              <span className="rounded bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                {o.payment_status}
              </span>
            )}
            {o.needs_van && (
              <span className="flex items-center gap-1 rounded bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                Needs van — contact customer
              </span>
            )}
          </div>
        </div>
        {isCancellable && <CancelOrderButton orderId={o.id} paymentStatus={o.payment_status} />}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <Card title="Pickup">
            <Field label="Address" value={o.pickup_address} />
            <Field label="City" value={`${o.pickup_city ?? "—"} ${o.pickup_postcode ?? ""}`} />
            <Field label="Sender" value={o.sender_name} />
            <Field label="Phone" value={o.sender_phone} />
          </Card>

          <Card title="Delivery">
            <Field label="Address" value={o.delivery_address} />
            <Field label="City" value={`${o.delivery_city ?? "—"} ${o.delivery_postcode ?? ""}`} />
            <Field label="Recipient" value={o.recipient_name} />
            <Field label="Phone" value={o.recipient_phone} />
            {o.verification_code && (
              <Field label="Verification code" value={o.verification_code} mono />
            )}
          </Card>

          <Card title="Package">
            <Field label="Category" value={o.product_category} />
            <Field label="Size" value={o.package_size} />
            <Field label="Weight" value={o.weight ? `${o.weight} kg` : null} />
            <Field label="Items" value={o.total_items ? String(o.total_items) : null} />
            <Field label="Driver instructions" value={o.driver_instructions} />
          </Card>

          <Card title="Timeline">
            <ol className="space-y-2">
              {TIMELINE.map((t) => {
                const ts = o[t.key as keyof Order] as string | null;
                return (
                  <li
                    key={t.key}
                    className="flex items-center justify-between text-[13px]"
                  >
                    <span
                      className={
                        ts
                          ? "font-semibold text-slate-900 dark:text-[#ede9f8]"
                          : "text-slate-400"
                      }
                    >
                      {t.label}
                    </span>
                    <span className="font-mono text-[12px] text-slate-500 dark:text-zinc-400">
                      {formatDateTime(ts)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card title="Customer">
            {o.customer_id ? (
              <>
                <Field label="Name" value={customerName ?? "—"} />
                <Field label="Email" value={customerEmail ?? "—"} />
                <Link
                  href={`/admin/customers/${o.customer_id}`}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  View customer
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-400">No customer linked.</p>
            )}
          </Card>

          <Card title="Driver">
            {o.driver_id ? (
              <>
                <Field label="Name" value={driverName ?? "—"} />
                <Field label="Phone" value={driverPhone ?? "—"} />
                <Link
                  href={`/admin/drivers/${o.driver_id}`}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  View driver
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-400">Unassigned.</p>
            )}
          </Card>

          <Card title="Pricing">
            <Field label="Base" value={`£${Number(o.base_price ?? 0).toFixed(2)}`} />
            <Field label="Size fee" value={`£${Number(o.size_fee ?? 0).toFixed(2)}`} />
            <Field
              label="Scheduling fee"
              value={`£${Number(o.scheduling_fee ?? 0).toFixed(2)}`}
            />
            <Field
              label="Discount"
              value={`-£${Number(o.discount_amount ?? 0).toFixed(2)}`}
            />
            <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-3 dark:border-zinc-800">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Total
              </span>
              <span className="text-2xl font-extrabold text-primary">
                £{Number(o.total_price).toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-400">
              Driver earnings: £{(Number(o.total_price) * 0.8).toFixed(2)}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0c0b14]">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-primary">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-[13px]">
      <span className="shrink-0 text-slate-500 dark:text-zinc-400">{label}</span>
      <span
        className={`text-right font-semibold text-slate-900 dark:text-[#ede9f8] ${mono ? "font-mono" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
