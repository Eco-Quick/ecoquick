import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { SuspendUserButton } from "@/components/admin/SuspendUserButton";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  delivery_city: string | null;
  scheduling_type: string;
};

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = createServiceClient();

  const [authRes, ordersRes] = await Promise.all([
    service.auth.admin.getUserById(id),
    service
      .from("delivery_orders")
      .select("id, status, total_price, created_at, delivery_city, scheduling_type")
      .eq("customer_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (!authRes.data?.user) notFound();
  const user = authRes.data.user;
  const orders = (ordersRes.data ?? []) as OrderRow[];

  const suspended = user.user_metadata?.suspended === true;
  const verification = user.user_metadata?.verification_status ?? "unverified";
  const lifetime = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to customers
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Customer profile
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {(user.user_metadata?.full_name as string) ?? user.email ?? "Unnamed"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{user.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                suspended
                  ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              }`}
            >
              {suspended ? "Suspended" : "Active"}
            </span>
            <span className="rounded bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              {verification}
            </span>
          </div>
        </div>
        <SuspendUserButton userId={id} suspended={suspended} label="customer" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-1">
          <Card title="Profile">
            <Field label="User ID" value={id} mono />
            <Field
              label="Joined"
              value={
                user.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <Field
              label="Last sign-in"
              value={
                user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <Field label="Phone" value={(user.user_metadata?.phone as string) ?? "—"} />
          </Card>
          <Card title="Lifetime stats">
            <Field label="Total orders" value={String(orders.length)} />
            <Field
              label="Delivered"
              value={String(orders.filter((o) => o.status === "delivered").length)}
            />
            <Field label="Lifetime value" value={`£${lifetime.toFixed(2)}`} />
          </Card>
        </section>

        <section className="lg:col-span-2">
          <Card title={`Recent orders (${orders.length})`}>
            {orders.length === 0 ? (
              <p className="text-sm text-slate-400">No orders yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between py-3 text-[13px] hover:bg-slate-50 dark:hover:bg-zinc-900"
                  >
                    <div>
                      <p className="font-mono font-semibold text-slate-900 dark:text-[#ede9f8]">
                        EQ-{o.id.slice(0, 6).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(o.created_at).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {o.delivery_city ?? "—"} · {o.status} · {o.scheduling_type}
                      </p>
                    </div>
                    <span className="font-bold text-primary">
                      £{Number(o.total_price).toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </section>
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
        className={`truncate text-right font-semibold text-slate-900 dark:text-[#ede9f8] ${mono ? "font-mono text-[11px]" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
