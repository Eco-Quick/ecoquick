"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AvailableOrder {
  id: string;
  pickup_address: string;
  pickup_city: string;
  delivery_address: string;
  delivery_city: string;
  total_price: number;
  scheduling_type: string;
  package_size: string;
  weight: number;
  product_category: string;
  created_at: string;
}

export default function DriverJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    const supabase = createClient();
    const channel = supabase
      .channel("available-jobs")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders", filter: "status=eq.confirmed" }, () => {
        fetchJobs();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchJobs() {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("delivery_orders")
      .select("id, pickup_address, pickup_city, delivery_address, delivery_city, total_price, scheduling_type, package_size, weight, product_category, created_at")
      .eq("status", "confirmed")
      .is("driver_id", null)
      .order("created_at", { ascending: false });
    if (!err && data) setJobs(data);
    setLoading(false);
  }

  async function handleAccept(orderId: string) {
    setAccepting(orderId);
    setError(null);
    try {
      const res = await fetch("/api/driver/accept-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const body = await res.json();
        if (body.error === "verification_required") { router.push("/verify"); return; }
        if (body.error === "age_restricted") {
          setError("You must be 18+ with a verified ID to deliver this item.");
          setAccepting(null);
          return;
        }
        throw new Error(body.error || "Failed to accept job");
      }
      router.push("/driver/track");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to accept job");
      setAccepting(null);
      fetchJobs();
    }
  }

  function timeAgo(dateStr: string) {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const isAgeRestricted = (cat: string) => ["alcohol", "tobacco"].includes(cat);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-8 md:pt-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-3xl">
            Available Jobs
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} available near you
          </p>
        </div>
        <button
          onClick={() => fetchJobs()}
          className="flex items-center gap-2 self-start rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[12px] font-semibold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.97] dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-3xl text-[#3e0074] dark:text-[#c084fc]">progress_activity</span>
        </div>
      ) : jobs.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <span className="material-symbols-outlined text-3xl text-zinc-400 dark:text-zinc-500">inventory_2</span>
          </div>
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No available jobs right now</p>
          <p className="max-w-sm text-center text-[13px] text-zinc-400 dark:text-zinc-500">
            New jobs appear automatically when customers place orders. Stay online to be notified.
          </p>
        </div>
      ) : (
        /* Job cards */
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-[#0c0b14] dark:hover:border-zinc-700 md:p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Left: Route info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {/* Route dots */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-2.5 w-2.5 rounded-full border-2 border-[#3e0074] dark:border-[#c084fc]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">
                        {job.pickup_city || job.pickup_address}
                      </p>
                      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                        {job.delivery_city || job.delivery_address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center: Details */}
                <div className="flex flex-wrap items-center gap-2 md:justify-center">
                  <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {job.package_size}
                  </span>
                  <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {job.weight}kg
                  </span>
                  {job.scheduling_type === "instant" ? (
                    <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      Express
                    </span>
                  ) : (
                    <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      Scheduled
                    </span>
                  )}
                  {isAgeRestricted(job.product_category) && (
                    <span className="rounded-lg bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      18+
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {timeAgo(job.created_at)}
                  </span>
                </div>

                {/* Right: Price + Accept */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#3e0074] dark:text-[#c084fc] md:text-3xl">
                      £{Number(job.total_price).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-zinc-400">earn £{(Number(job.total_price) * 0.8).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleAccept(job.id)}
                    disabled={accepting === job.id}
                    className="shrink-0 rounded-xl bg-[#3e0074] px-6 py-3.5 text-[12px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] disabled:opacity-60 dark:bg-[#5b21b6]"
                  >
                    {accepting === job.id ? "Accepting…" : "Accept"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
