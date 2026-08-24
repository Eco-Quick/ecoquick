import { SystemStatusDashboard } from "./SystemStatusDashboard";

export const dynamic = "force-dynamic";

export default function AdminSystemPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Operations
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          SYSTEM
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          Live site traffic and the health of everything EcoQuick depends on.
        </p>
      </div>

      <SystemStatusDashboard />
    </div>
  );
}
