"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { CustomerMobileNav } from "@/components/layout/CustomerMobileNav";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  active: number;
  co2kg: number;
  totalSpent: number;
  completed: number;
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const user = useCustomerAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    if (!user) return;
    setFirstName(user.name?.split(" ")[0] || "there");
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setVerificationStatus(u?.user_metadata?.verification_status || "unverified");
    });
    supabase
      .from("delivery_orders")
      .select("status, weight, total_price")
      .eq("customer_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const active = data.filter((o) => ["pending", "confirmed", "assigned", "picked_up", "in_transit"].includes(o.status ?? "")).length;
        const delivered = data.filter((o) => o.status === "delivered");
        const co2kg = parseFloat(delivered.reduce((sum, o) => sum + (o.weight ?? 0) * 0.15, 0).toFixed(1));
        const totalSpent = parseFloat(data.reduce((sum, o) => sum + (o.total_price ?? 0), 0).toFixed(2));
        setStats({ active, co2kg, totalSpent, completed: delivered.length });
      });
  }, [user]);

  if (!user) return null;

  const isNewUser = stats && stats.completed === 0 && stats.active === 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0d0916] dark:text-[#ede9f8]">
      <CustomerTopBar />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-10 md:pt-8">

        {/* Verification banner */}
        {verificationStatus && verificationStatus !== "verified" && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/30 dark:bg-amber-900/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-amber-600">verified_user</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {verificationStatus === "pending" ? "Verification under review" : "Verify your identity"}
                </p>
                <p className="text-[12px] text-amber-700/70 dark:text-amber-400/70">
                  {verificationStatus === "pending" ? "We're reviewing your ID." : "Required before you can book deliveries."}
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

        {/* Greeting */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-3xl">
              Hey, {firstName}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {isNewUser ? "Welcome to EcoQuick! Book your first delivery." : "Manage your deliveries and track impact."}
            </p>
          </div>
          <button
            onClick={() => router.push("/book/type")}
            className="flex items-center gap-3 self-start rounded-full bg-[#3e0074] px-8 py-4 text-[14px] font-bold text-white shadow-[0_6px_24px_rgba(63,0,117,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(63,0,117,0.45)] active:scale-[0.97] dark:bg-[#5b21b6] dark:shadow-[0_6px_24px_rgba(91,33,182,0.35)]"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Book a Delivery
          </button>
        </div>

        {/* Welcome card for new users */}
        {isNewUser && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3e0074] to-[#6d28d9] p-8 text-white dark:from-[#5b21b6] dark:to-[#7c3aed] md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold md:text-2xl">Send your first parcel</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                  Fast, carbon-neutral delivery across London. Book in under 2 minutes
                  and track your parcel in real-time.
                </p>
              </div>
              <button
                onClick={() => router.push("/book/type")}
                className="shrink-0 rounded-full bg-white px-8 py-3.5 text-[13px] font-bold text-[#3e0074] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
              >
                Book a Delivery
              </button>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#161027]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Active</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <span className="material-symbols-outlined text-base text-blue-600">local_shipping</span>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8]">
              {stats?.active ?? "—"}
            </p>
            <p className="mt-0.5 text-[12px] text-zinc-400">in progress</p>
          </div>

          <div className="rounded-2xl bg-[#3e0074] p-6 text-white dark:bg-[#5b21b6]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/60">CO₂ Offset</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <span className="material-symbols-outlined text-base text-emerald-300">eco</span>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold">
              {stats ? `${stats.co2kg} kg` : "—"}
            </p>
            <p className="mt-0.5 text-[12px] text-white/50">carbon saved</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#161027]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Spent</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <span className="material-symbols-outlined text-base text-amber-600">payments</span>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8]">
              {stats ? `£${stats.totalSpent.toFixed(2)}` : "—"}
            </p>
            <p className="mt-0.5 text-[12px] text-zinc-400">total</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#161027]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Completed</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8]">
              {stats?.completed ?? "—"}
            </p>
            <p className="mt-0.5 text-[12px] text-zinc-400">deliveries</p>
          </div>
        </div>

        {/* Quick actions + Impact */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Quick actions */}
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#161027]">
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">Quick Actions</h2>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {[
                { label: "Book a delivery", desc: "Send a parcel now", icon: "add_circle", href: "/book/type" },
                { label: "View orders", desc: "Track & manage", icon: "list_alt", href: "/orders" },
                { label: "Impact report", desc: "Your carbon savings", icon: "eco", href: "/impact" },
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

          {/* Impact card */}
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#161027] lg:col-span-2">
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">Your Impact</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-emerald-50 p-5 dark:bg-emerald-900/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-emerald-600">eco</span>
                    <p className="text-[11px] font-semibold uppercase text-emerald-600">CO₂ Saved</p>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {stats ? `${stats.co2kg} kg` : "0 kg"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-emerald-600/60">carbon offset</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-5 dark:bg-[#0d0916]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-zinc-500">forest</span>
                    <p className="text-[11px] font-semibold uppercase text-zinc-500">Trees</p>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-[#ede9f8]">
                    {stats ? Math.round(stats.co2kg / 22) : 0}
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-400">equivalent saplings</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-5 dark:bg-[#0d0916]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-zinc-500">electric_bike</span>
                    <p className="text-[11px] font-semibold uppercase text-zinc-500">Green Trips</p>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-[#ede9f8]">
                    {stats?.completed ?? 0}
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-400">zero-emission deliveries</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">100% electric fleet</p>
                  <p className="text-[12px] text-zinc-400">Every delivery is carbon-neutral</p>
                </div>
                <button
                  onClick={() => router.push("/impact")}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-[12px] font-semibold text-zinc-600 transition-all hover:border-[#3e0074]/30 hover:text-[#3e0074] active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-[#c084fc]/30 dark:hover:text-[#c084fc]"
                >
                  Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CustomerMobileNav />
    </div>
  );
}
