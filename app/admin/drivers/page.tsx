import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type DriverRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  vehicle_type: string | null;
  is_online: boolean | null;
  rating: number | null;
  total_deliveries: number | null;
  total_earnings: number | null;
  current_order_id: string | null;
};

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter ?? "all";
  const query = (params.q ?? "").trim().toLowerCase();

  const service = createServiceClient();
  let req = service
    .from("driver_profiles")
    .select(
      "id, full_name, phone, vehicle_type, is_online, rating, total_deliveries, total_earnings, current_order_id"
    )
    .order("total_deliveries", { ascending: false })
    .limit(200);

  if (filter === "online") req = req.eq("is_online", true);
  if (filter === "active") req = req.not("current_order_id", "is", null);

  const { data } = await req;
  let rows: DriverRow[] = (data as DriverRow[] | null) ?? [];

  if (query) {
    rows = rows.filter(
      (r) =>
        (r.full_name ?? "").toLowerCase().includes(query) ||
        (r.phone ?? "").toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
    );
  }

  const filters = [
    { key: "all", label: "All drivers" },
    { key: "online", label: "Online" },
    { key: "active", label: "On a job" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            People
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            DRIVERS
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            {rows.length} driver{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <form className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by name or phone…"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-[#0c0b14] md:w-72"
          />
          <input type="hidden" name="filter" value={filter} />
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
          const isActive = filter === f.key;
          const href = f.key === "all" ? "/admin/drivers" : `/admin/drivers?filter=${f.key}`;
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
            directions_car
          </span>
          <p className="text-sm font-semibold text-slate-400">No drivers found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
          <div className="hidden grid-cols-12 border-b border-slate-100 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-zinc-800 dark:bg-[#050507] dark:text-zinc-500 md:grid">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Vehicle</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Rating</div>
            <div className="col-span-1 text-right">Deliveries</div>
            <div className="col-span-2 text-right">Earned</div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {rows.map((d) => (
              <Link
                key={d.id}
                href={`/admin/drivers/${d.id}`}
                className="block px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900 md:grid md:grid-cols-12 md:items-center md:gap-2"
              >
                <div className="col-span-3 font-semibold text-slate-900 dark:text-[#ede9f8]">
                  {d.full_name ?? "Unnamed"}
                  {d.current_order_id && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                      On job
                    </span>
                  )}
                </div>
                <div className="col-span-2 mt-1 text-[12px] text-slate-500 dark:text-zinc-400 md:mt-0">
                  {d.phone ?? "—"}
                </div>
                <div className="col-span-2 text-[12px] text-slate-500 dark:text-zinc-400 md:mt-0">
                  {d.vehicle_type ?? "—"}
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest ${
                      d.is_online
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${d.is_online ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                    {d.is_online ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="col-span-1 text-[12px] font-semibold text-slate-900 dark:text-[#ede9f8]">
                  {d.rating ? `★ ${Number(d.rating).toFixed(2)}` : "—"}
                </div>
                <div className="col-span-1 text-right text-[12px] font-semibold text-slate-900 dark:text-[#ede9f8]">
                  {d.total_deliveries ?? 0}
                </div>
                <div className="col-span-2 text-right font-bold text-primary">
                  £{Number(d.total_earnings ?? 0).toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
