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

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("delivery_orders")
      .select("status, weight, total_price")
      .eq("customer_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const active = data.filter((o) =>
          ["pending", "in_transit"].includes(o.status ?? "")
        ).length;
        const delivered = data.filter((o) => o.status === "delivered");
        const co2kg = parseFloat(
          delivered
            .reduce((sum, o) => sum + (o.weight ?? 0) * 0.15, 0)
            .toFixed(1)
        );
        const totalSpent = parseFloat(
          data.reduce((sum, o) => sum + (o.total_price ?? 0), 0).toFixed(2)
        );
        const completed = delivered.length;
        setStats({ active, co2kg, totalSpent, completed });
      });
  }, [user]);

  const scrollToId = (id: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!user) return null;

  return (
    <div className="page-fade min-h-screen overflow-x-hidden dashboard-grid-bg text-primary dark:text-[#c084fc]">
      <CustomerTopBar />

      <main className="mx-auto min-h-screen max-w-6xl pb-16 lg:pb-20">
        <div className="px-5 py-6 sm:px-6 lg:py-10" id="dashboard-top">
          <section className="mb-8 lg:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/40">
              Customer dashboard
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#151018] dark:text-[#ede9f8] sm:text-3xl">
              Welcome back,{" "}
              <span>{user.name}</span>
            </h1>
            <p className="mt-2 text-sm font-normal text-[#5a5a5a] dark:text-zinc-400">
              Create a new EcoQuick delivery or review your recent activity.
            </p>

            <div className="mt-6 inline-flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                className="btn-press inline-flex items-center justify-center gap-2 border border-primary bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-sm transition-colors hover:bg-zinc-100"
                onClick={() => router.push("/book/type")}
              >
                <span className="material-symbols-outlined text-base text-accent">
                  add
                </span>
                New delivery
              </button>
              <button
                className="btn-press inline-flex items-center justify-center gap-2 border border-primary bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-sm transition-colors hover:bg-zinc-100"
                onClick={() => router.push("/orders")}
              >
                <span className="material-symbols-outlined text-base text-accent">
                  arrow_forward
                </span>
                Track order
              </button>
            </div>
          </section>

          <section className="relative mb-10 overflow-hidden rounded-lg border border-primary/10 bg-[rgba(62,0,116,0.015)] p-6 lg:p-8">
            <div className="pointer-events-none absolute right-[-120px] top-[-80px] hidden h-56 w-56 rounded-full border border-primary/20 sm:block lg:border-primary/30" />
            <div className="pointer-events-none absolute right-[-40px] bottom-[-80px] h-40 w-40 rounded-full border border-primary/20 sm:block lg:border-primary/30" />
            <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
              <h2 className="text-lg font-semibold tracking-tight text-[#151018] dark:text-[#ede9f8] sm:text-xl">
                Ready for your next delivery?
              </h2>
              <p className="text-sm font-normal leading-relaxed text-[#5a5a5a] dark:text-zinc-400">
                Keep your parcels moving with fast, low-emission deliveries
                across the city — optimized for time and carbon impact.
              </p>
              <button
                className="btn-pill-primary btn-press inline-flex items-center justify-center px-10 py-3 text-[11px] font-semibold uppercase tracking-[0.24em]"
                onClick={() => router.push("/book/type")}
              >
                Book now
              </button>
            </div>
          </section>

          <section className="mb-10 lg:mb-12" id="overview-section">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/50">
                Overview
              </h3>
              <button
                className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70 hover:text-primary md:inline-flex"
                onClick={() => scrollToId("impact-section")}
              >
                View impact summary
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1 - light */}
              <div className="card-hover flex flex-col justify-between rounded-lg border border-primary/10 bg-white p-4 dark:bg-[#161027]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/50">
                    Active deliveries
                  </span>
                  <span className="material-symbols-outlined text-base text-accent">
                    inventory_2
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-[#151018] dark:text-[#ede9f8]">
                  {stats ? stats.active : "—"}
                </p>
                <p className="mt-1 text-xs text-[#5a5a5a] dark:text-zinc-400">in progress right now</p>
              </div>
              {/* Card 2 - purple */}
              <div className="card-hover flex flex-col justify-between rounded-lg border border-primary/10 bg-primary p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    CO₂ offset
                  </span>
                  <span className="material-symbols-outlined text-base text-accent">
                    eco
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight">
                  {stats ? `${stats.co2kg}kg` : "—"}
                </p>
                <p className="mt-1 text-xs text-white/80">
                  saved across your deliveries
                </p>
              </div>
              {/* Card 3 - light */}
              <div className="card-hover flex flex-col justify-between rounded-lg border border-primary/10 bg-white p-4 dark:bg-[#161027]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/50">
                    Total spent
                  </span>
                  <span className="material-symbols-outlined text-base text-accent">
                    payments
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-[#151018] dark:text-[#ede9f8]">
                  {stats ? `£${stats.totalSpent.toFixed(2)}` : "—"}
                </p>
                <p className="mt-1 text-xs text-[#5a5a5a] dark:text-zinc-400">
                  across all your bookings
                </p>
              </div>
              {/* Card 4 - purple */}
              <div className="card-hover flex flex-col justify-between rounded-lg border border-primary/10 bg-primary p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    Completed
                  </span>
                  <span className="material-symbols-outlined text-base text-accent">
                    check_circle
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight">
                  {stats ? stats.completed : "—"}
                </p>
                <p className="mt-1 text-xs text-white/80">
                  deliveries successfully delivered
                </p>
              </div>
            </div>
          </section>

          <section className="mb-4 lg:mb-6" id="impact-section">
            <div className="relative overflow-hidden rounded-lg border border-primary/10 bg-white p-6 lg:p-8">
              <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
                    Impact efficiency
                  </h3>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-4xl font-semibold tracking-tight text-[#151018] dark:text-[#ede9f8] lg:text-5xl">
                    85%
                  </span>
                    <span className="material-symbols-outlined text-xl text-accent lg:text-2xl">
                    energy_savings_leaf
                  </span>
                </div>
                  <p className="mt-2 max-w-md text-sm font-normal leading-relaxed text-[#5a5a5a] dark:text-zinc-400">
                    Your deliveries are outperforming{" "}
                    <span className="font-semibold text-primary">
                      85% of regional benchmarks
                    </span>{" "}
                    on carbon efficiency.
                  </p>
                </div>
                <div className="flex flex-col gap-3 text-xs lg:items-end">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/50">
                    Last 30 days · Auto-calculated
                  </p>
                  <button
                    className="inline-flex items-center justify-center border border-accent/60 bg-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:bg-accent hover:text-white"
                    onClick={() => router.push("/impact")}
                  >
                    View impact report
                  </button>
                </div>
              </div>
            </div>
          </section>

          <footer className="flex flex-col items-center justify-between gap-4 border-t border-primary/10 pb-10 pt-6 text-center text-[8px] font-black uppercase tracking-[0.2em] opacity-40 lg:flex-row lg:items-start lg:pb-6 lg:pt-8 lg:text-left lg:text-[9px]">
            <div className="space-y-0.5 lg:space-y-1">
              <p>© 2024 EcoQuick Logistics Intl.</p>
              <p>Architecture V2.1.0-Compact</p>
            </div>
            <div className="flex gap-4 lg:gap-8">
              <button
                className="hover:text-primary"
                onClick={() => router.push("/help")}
              >
                Terms
              </button>
              <button
                className="hover:text-primary"
                onClick={() => router.push("/help")}
              >
                Privacy
              </button>
              <button
                className="hover:text-primary"
                onClick={() => router.push("/help")}
              >
                API Docs
              </button>
            </div>
          </footer>
        </div>
      </main>

      <CustomerMobileNav />
    </div>
  );
}

