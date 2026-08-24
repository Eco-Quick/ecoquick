import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type EventType = "login_attempt" | "signup" | "order_placed";

type SecurityEvent = {
  id: string;
  event_type: EventType;
  success: boolean | null;
  email: string | null;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

async function getEvents(): Promise<SecurityEvent[]> {
  const service = createServiceClient();
  const { data } = await service
    .from("security_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

const EVENT_META: Record<EventType, { label: string; icon: string }> = {
  login_attempt: { label: "Login attempt", icon: "login" },
  signup: { label: "New signup", icon: "person_add" },
  order_placed: { label: "Order placed", icon: "local_shipping" },
};

function StatusPill({ success }: { success: boolean | null }) {
  if (success === null) {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
        —
      </span>
    );
  }
  return success ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
      Success
    </span>
  ) : (
    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
      Failed
    </span>
  );
}

function eventDetail(e: SecurityEvent): string | null {
  if (e.event_type === "order_placed") {
    const price = e.metadata?.total_price ? `£${e.metadata.total_price}` : null;
    const van = e.metadata?.needs_van ? "🚐 Van needed" : null;
    const outOfRadius = e.metadata?.out_of_radius ? "📍 Out of radius" : null;
    return [price, van, outOfRadius].filter(Boolean).join(" · ") || null;
  }
  if (e.event_type === "signup" && e.metadata?.role) {
    return String(e.metadata.role) + (e.metadata.via ? ` · ${e.metadata.via}` : "");
  }
  return null;
}

export default async function AdminActivityPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Overview
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          ACTIVITY
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          Login attempts, signups, and orders as they happen. Latest 100 events.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
        {events.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400 dark:text-zinc-500">
            No activity recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
                  <th className="px-5 py-3">Event</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Detail</th>
                  <th className="px-5 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const meta = EVENT_META[e.event_type];
                  const detail = eventDetail(e);
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-slate-100 last:border-0 dark:border-zinc-900"
                    >
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-base text-primary">
                            {meta.icon}
                          </span>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill success={e.success} />
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">
                        {e.email ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-zinc-500">
                        {detail ?? "—"}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-slate-400 dark:text-zinc-500">
                        {new Date(e.created_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
