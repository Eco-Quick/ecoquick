import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();
  const page = Math.max(1, Number(params.page ?? 1));
  const perPage = 50;

  const service = createServiceClient();

  const { data: usersData } = await service.auth.admin.listUsers({
    page,
    perPage,
  });
  const users = usersData?.users ?? [];

  // Identify drivers so we can exclude them
  const ids = users.map((u) => u.id);
  let driverIds = new Set<string>();
  if (ids.length > 0) {
    const { data: drivers } = await service
      .from("driver_profiles")
      .select("id")
      .in("id", ids);
    driverIds = new Set((drivers ?? []).map((d) => d.id));
  }

  const customers = users
    .filter((u) => !driverIds.has(u.id))
    .filter((u) => u.user_metadata?.role !== "admin")
    .filter((u) => {
      if (!query) return true;
      const hay = `${u.email ?? ""} ${(u.user_metadata?.full_name as string) ?? ""}`.toLowerCase();
      return hay.includes(query);
    });

  // Order count per customer (via service client, fetch in bulk)
  const customerIds = customers.map((u) => u.id);
  const orderCounts: Record<string, number> = {};
  if (customerIds.length > 0) {
    const { data: orders } = await service
      .from("delivery_orders")
      .select("customer_id")
      .in("customer_id", customerIds);
    for (const row of orders ?? []) {
      if (row.customer_id) {
        orderCounts[row.customer_id] = (orderCounts[row.customer_id] ?? 0) + 1;
      }
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            People
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            CUSTOMERS
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            {customers.length} customer{customers.length !== 1 ? "s" : ""} on page {page}
          </p>
        </div>
        <form className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-[#0c0b14] md:w-72"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-[12px] font-bold text-white"
          >
            Search
          </button>
        </form>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 py-20 dark:border-zinc-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-zinc-600">
            group
          </span>
          <p className="text-sm font-semibold text-slate-400">No customers found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
          <div className="hidden grid-cols-12 border-b border-slate-100 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-zinc-800 dark:bg-[#050507] dark:text-zinc-500 md:grid">
            <div className="col-span-4">Name</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1 text-right">Orders</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {customers.map((u) => {
              const suspended = u.user_metadata?.suspended === true;
              return (
                <Link
                  key={u.id}
                  href={`/admin/customers/${u.id}`}
                  className="block px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900 md:grid md:grid-cols-12 md:items-center md:gap-2"
                >
                  <div className="col-span-4 font-semibold text-slate-900 dark:text-[#ede9f8]">
                    {(u.user_metadata?.full_name as string) ?? "—"}
                  </div>
                  <div className="col-span-4 mt-1 truncate text-[12px] text-slate-500 dark:text-zinc-400 md:mt-0">
                    {u.email ?? "—"}
                  </div>
                  <div className="col-span-2 text-[12px] text-slate-500 dark:text-zinc-400 md:mt-0">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </div>
                  <div className="col-span-1 text-right font-bold text-primary">
                    {orderCounts[u.id] ?? 0}
                  </div>
                  <div className="col-span-1 text-right">
                    {suspended ? (
                      <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-[12px]">
        {page > 1 ? (
          <Link
            href={`/admin/customers?page=${page - 1}${query ? `&q=${query}` : ""}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {users.length === perPage && (
          <Link
            href={`/admin/customers?page=${page + 1}${query ? `&q=${query}` : ""}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
