import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { SuspendUserButton } from "@/components/admin/SuspendUserButton";

export const dynamic = "force-dynamic";

type DriverProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  vehicle_type: string | null;
  is_online: boolean | null;
  rating: number | null;
  total_deliveries: number | null;
  total_earnings: number | null;
  current_order_id: string | null;
  current_lat: number | null;
  current_lng: number | null;
};

type OrderRow = {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  delivery_city: string | null;
};

export default async function AdminDriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = createServiceClient();

  const [profileRes, ordersRes, authRes] = await Promise.all([
    service.from("driver_profiles").select("*").eq("id", id).maybeSingle(),
    service
      .from("delivery_orders")
      .select("id, status, total_price, created_at, delivery_city")
      .eq("driver_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    service.auth.admin.getUserById(id),
  ]);

  if (!profileRes.data) notFound();
  const p = profileRes.data as DriverProfile;
  const orders = (ordersRes.data ?? []) as OrderRow[];
  const authUser = authRes.data?.user ?? null;
  const isSuspended = authUser?.user_metadata?.suspended === true;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/drivers"
          className="inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to drivers
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Driver profile
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {p.full_name ?? "Unnamed driver"}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                p.is_online
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${p.is_online ? "bg-emerald-500" : "bg-slate-400"}`}
              />
              {p.is_online ? "Online" : "Offline"}
            </span>
            {p.current_order_id && (
              <Link
                href={`/admin/orders/${p.current_order_id}`}
                className="rounded bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-700 hover:underline dark:bg-violet-900/20 dark:text-violet-400"
              >
                On active job →
              </Link>
            )}
            {isSuspended && (
              <span className="rounded bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-red-700 dark:bg-red-900/20 dark:text-red-400">
                Suspended
              </span>
            )}
          </div>
        </div>
        <SuspendUserButton userId={p.id} suspended={isSuspended} label="driver" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-1">
          <Card title="Contact">
            <Field label="Email" value={authUser?.email ?? "—"} />
            <Field label="Phone" value={p.phone ?? "—"} />
            <Field label="User ID" value={p.id} mono />
            <Field label="Vehicle" value={p.vehicle_type ?? "—"} />
            <Field
              label="Joined"
              value={
                authUser?.created_at
                  ? new Date(authUser.created_at).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <Field
              label="Verification"
              value={authUser?.user_metadata?.verification_status ?? "unverified"}
            />
          </Card>
          <Card title="Performance">
            <Field
              label="Rating"
              value={p.rating ? `★ ${Number(p.rating).toFixed(2)}` : "—"}
            />
            <Field label="Deliveries" value={String(p.total_deliveries ?? 0)} />
            <Field
              label="Total earnings"
              value={`£${Number(p.total_earnings ?? 0).toFixed(2)}`}
            />
            <Field
              label="Last location"
              value={
                p.current_lat && p.current_lng
                  ? `${p.current_lat.toFixed(4)}, ${p.current_lng.toFixed(4)}`
                  : "—"
              }
            />
          </Card>
        </section>

        <section className="lg:col-span-2">
          <Card title={`Recent deliveries (${orders.length})`}>
            {orders.length === 0 ? (
              <p className="text-sm text-slate-400">No deliveries yet.</p>
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
                        · {o.delivery_city ?? "—"} · {o.status}
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
