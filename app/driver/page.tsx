"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DriverStats {
  todayEarnings: number;
  todayDeliveries: number;
  activeOrders: number;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  co2Saved: number;
}

export default function DriverDashboardPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [driverName, setDriverName] = useState("Driver");
  const [stats, setStats] = useState<DriverStats>({
    todayEarnings: 0,
    todayDeliveries: 0,
    activeOrders: 0,
    rating: 5.0,
    totalDeliveries: 0,
    totalEarnings: 0,
    co2Saved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string>("unverified");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (user.user_metadata?.full_name) {
      setDriverName(user.user_metadata.full_name.split(" ")[0]);
    }

    const verStatus = user.user_metadata?.verification_status;
    setVerificationStatus(verStatus || "unverified");

    const { data: profile } = await supabase
      .from("driver_profiles")
      .select("is_online, rating, total_deliveries, total_earnings")
      .eq("id", user.id)
      .single();

    if (profile) setIsOnline(profile.is_online);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayOrders } = await supabase
      .from("delivery_orders")
      .select("total_price, weight, status")
      .eq("driver_id", user.id)
      .eq("status", "delivered")
      .gte("delivered_at", todayStart.toISOString());

    const todayDeliveries = todayOrders?.length ?? 0;
    const todayEarnings = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total_price) * 0.8, 0);
    const co2Saved = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.weight) * 0.15, 0);

    const { count: activeOrders } = await supabase
      .from("delivery_orders")
      .select("id", { count: "exact", head: true })
      .eq("driver_id", user.id)
      .in("status", ["assigned", "picked_up", "in_transit"]);

    setStats({
      todayEarnings,
      todayDeliveries,
      activeOrders: activeOrders ?? 0,
      rating: Number(profile?.rating ?? 5.0),
      totalDeliveries: profile?.total_deliveries ?? 0,
      totalEarnings: Number(profile?.total_earnings ?? 0),
      co2Saved,
    });
    setLoading(false);
  }

  async function toggleOnline() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newVal = !isOnline;
    setIsOnline(newVal);
    await supabase
      .from("driver_profiles")
      .update({ is_online: newVal, updated_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  const stars = Math.round(stats.rating * 2) / 2;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-[#3e0074] dark:text-[#c084fc]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-8 md:pt-8">

      {/* Top bar: greeting + status toggle */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-3xl">
            Hey, {driverName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isOnline ? "You're online and visible to customers." : "You're offline. Go online to receive jobs."}
          </p>
        </div>
        <button
          onClick={toggleOnline}
          className={`flex items-center gap-3 rounded-full px-6 py-3 text-[13px] font-bold transition-all duration-300 ${
            isOnline
              ? "bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-600"
              : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-zinc-400 dark:bg-zinc-600"}`} />
          {isOnline ? "Online" : "Offline"}
        </button>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Earnings — featured */}
        <div className="rounded-2xl bg-[#3e0074] p-6 text-white dark:bg-[#5b21b6]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Today&apos;s Earnings</span>
            <span className="material-symbols-outlined text-lg text-white/40">payments</span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight">£{stats.todayEarnings.toFixed(2)}</p>
          <p className="mt-1 text-[12px] text-white/50">£{stats.totalEarnings.toFixed(2)} all time</p>
        </div>

        {/* Deliveries */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#161027]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Deliveries</span>
            <span className="material-symbols-outlined text-lg text-zinc-300 dark:text-zinc-600">local_shipping</span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-[#ede9f8]">{stats.todayDeliveries}</p>
          <p className="mt-1 text-[12px] text-zinc-400">{stats.totalDeliveries} total</p>
        </div>

        {/* Rating */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#161027]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Rating</span>
            <span className="material-symbols-outlined text-lg text-zinc-300 dark:text-zinc-600">star</span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-[#ede9f8]">{stats.rating.toFixed(1)}</p>
          <div className="mt-1 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="material-symbols-outlined text-sm text-amber-400">
                {i <= Math.floor(stars) ? "star" : i - 0.5 <= stars ? "star_half" : "star_outline"}
              </span>
            ))}
          </div>
        </div>

        {/* Active */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#161027]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Active Now</span>
            {stats.activeOrders > 0 && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />}
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-[#ede9f8]">{stats.activeOrders}</p>
          <p className="mt-1 text-[12px] text-zinc-400">{stats.activeOrders > 0 ? "In progress" : "None active"}</p>
        </div>
      </div>

      {/* Verification banner */}
      {verificationStatus !== "verified" && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/30 dark:bg-amber-900/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-amber-600">verified_user</span>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {verificationStatus === "pending" ? "Verification under review" : "Verify your identity"}
              </p>
              <p className="text-[12px] text-amber-700/70 dark:text-amber-400/70">
                {verificationStatus === "pending" ? "We're reviewing your ID." : "Required before you can accept delivery jobs."}
              </p>
            </div>
          </div>
          {verificationStatus !== "pending" && (
            <button
              onClick={() => router.push("/verify")}
              className="shrink-0 rounded-lg bg-amber-600 px-5 py-2 text-[12px] font-bold text-white transition-all hover:bg-amber-700 active:scale-[0.98]"
            >
              Verify Now
            </button>
          )}
        </div>
      )}

      {/* Welcome banner for new drivers */}
      {stats.totalDeliveries === 0 && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#3e0074] to-[#6d28d9] p-8 text-white dark:from-[#5b21b6] dark:to-[#7c3aed] md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold md:text-2xl">Welcome to EcoQuick</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                You haven&apos;t made any deliveries yet. Go online, browse available jobs, and complete
                your first delivery to start earning and building your driver rating.
              </p>
            </div>
            <button
              onClick={() => router.push("/driver/jobs")}
              className="shrink-0 rounded-full bg-white px-8 py-3.5 text-[13px] font-bold text-[#3e0074] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
            >
              Find your first job
            </button>
          </div>
        </div>
      )}

      {/* Main grid: Quick actions + Summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#161027]">
          <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">Quick Actions</h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {[
              { label: "Find Deliveries", icon: "explore", desc: "Browse available jobs", href: "/driver/jobs" },
              { label: "Active Delivery", icon: "navigation", desc: "Track current order", href: "/driver/track" },
              { label: "View Earnings", icon: "account_balance_wallet", desc: "Payment history", href: "/driver/earnings" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="group flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3e0074]/10 text-[#3e0074] dark:bg-[#c084fc]/10 dark:text-[#c084fc]">
                  <span className="material-symbols-outlined text-lg">{action.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">{action.label}</p>
                  <p className="text-[12px] text-zinc-400 dark:text-zinc-500">{action.desc}</p>
                </div>
                <span className="material-symbols-outlined text-lg text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's summary */}
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#161027] lg:col-span-2">
          <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">Today&apos;s Summary</h2>
          </div>
          <div className="p-6">
            {/* Summary metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-zinc-50 p-5 dark:bg-[#0d0916]">
                <p className="text-[11px] font-semibold uppercase text-zinc-400">Completed</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-[#ede9f8]">{stats.todayDeliveries}</p>
                <p className="mt-0.5 text-[12px] text-zinc-400">deliveries today</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-5 dark:bg-[#0d0916]">
                <p className="text-[11px] font-semibold uppercase text-zinc-400">Avg Earning</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-[#ede9f8]">
                  £{stats.todayDeliveries > 0 ? (stats.todayEarnings / stats.todayDeliveries).toFixed(2) : "0.00"}
                </p>
                <p className="mt-0.5 text-[12px] text-zinc-400">per delivery</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-5 dark:bg-emerald-900/10">
                <p className="text-[11px] font-semibold uppercase text-emerald-600">CO₂ Saved</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.co2Saved.toFixed(1)} kg</p>
                <p className="mt-0.5 text-[12px] text-emerald-600/60">carbon offset today</p>
              </div>
            </div>

            {/* Earnings breakdown */}
            <div className="mt-6 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Today&apos;s deliveries</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">{stats.todayDeliveries}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Today&apos;s earnings</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">£{stats.todayEarnings.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Total earnings (all time)</span>
                  <span className="text-sm font-bold text-[#3e0074] dark:text-[#c084fc]">£{stats.totalEarnings.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            {stats.activeOrders === 0 && (
              <button
                onClick={() => router.push("/driver/jobs")}
                className="mt-6 w-full rounded-xl bg-[#3e0074] py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] dark:bg-[#5b21b6]"
              >
                Find available deliveries
              </button>
            )}
            {stats.activeOrders > 0 && (
              <button
                onClick={() => router.push("/driver/track")}
                className="mt-6 w-full rounded-xl bg-emerald-500 py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                View active delivery
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
