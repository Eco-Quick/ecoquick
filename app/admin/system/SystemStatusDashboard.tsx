"use client";

import { useEffect, useState, useCallback } from "react";

type Check = { name: string; ok: boolean; latencyMs: number | null; detail: string };
type ErrorRow = { id: string; source: string; message: string; context: Record<string, unknown>; created_at: string };
type PageViewRow = { id: string; path: string; session_id: string; created_at: string };

type StatusResponse = {
  checks: Check[];
  site: { ok: boolean; detail: string };
  liveVisitorCount: number;
  pageViewsToday: number;
  recentPageViews: PageViewRow[];
  recentErrors: ErrorRow[];
  checkedAt: string;
};

const POLL_INTERVAL_MS = 15000;

export function SystemStatusDashboard() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/system-status");
      if (!res.ok) throw new Error("Failed to load status");
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
        {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Live visitors" value={String(data.liveVisitorCount)} icon="visibility" tone="emerald" pulse />
        <StatCard label="Page views today" value={String(data.pageViewsToday)} icon="trending_up" tone="primary" />
        <StatCard
          label="Site status"
          value={data.site.ok ? "Online" : "Down"}
          icon="dns"
          tone={data.site.ok ? "emerald" : "red"}
        />
      </div>

      {/* Dependency health */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Dependent services</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {data.checks.map((c) => (
            <div key={c.name} className="flex items-center justify-between px-6 py-3.5">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${c.ok ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{c.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-slate-400">
                <span className={c.ok ? "" : "font-semibold text-red-600 dark:text-red-400"}>{c.detail}</span>
                {c.latencyMs !== null && <span>{c.latencyMs}ms</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent page views + errors */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Recent page views</h2>
          </div>
          {data.recentPageViews.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">No page views yet.</p>
          ) : (
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800">
              {data.recentPageViews.map((pv) => (
                <div key={pv.id} className="flex items-center justify-between px-6 py-2.5 text-[12px]">
                  <span className="font-mono text-slate-700 dark:text-zinc-300">{pv.path}</span>
                  <span className="text-slate-400">{new Date(pv.created_at).toLocaleTimeString("en-GB")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Recent errors</h2>
          </div>
          {data.recentErrors.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">No errors logged. 🎉</p>
          ) : (
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800">
              {data.recentErrors.map((e) => (
                <div key={e.id} className="px-6 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                      {e.source}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(e.created_at).toLocaleTimeString("en-GB")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-slate-600 dark:text-zinc-400">{e.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        Updated {new Date(data.checkedAt).toLocaleTimeString("en-GB")} · refreshes every 15s
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  pulse,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "primary" | "emerald" | "red";
  pulse?: boolean;
}) {
  const toneMap = {
    primary: "text-primary bg-primary/10",
    emerald: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
    red: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0c0b14]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">{label}</p>
        <span className={`relative flex h-9 w-9 items-center justify-center rounded-full ${toneMap[tone]}`}>
          {pulse && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />}
          <span className="material-symbols-outlined relative text-lg">{icon}</span>
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#ede9f8]">{value}</p>
    </div>
  );
}
