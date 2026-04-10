"use client";

import { useState, useEffect } from "react";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { CustomerMobileNav } from "@/components/layout/CustomerMobileNav";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";

export default function ImpactReportPage() {
  const user = useCustomerAuth();
  const [co2Offset, setCo2Offset] = useState(0);
  const [deliveryCount, setDeliveryCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("delivery_orders")
      .select("weight")
      .eq("customer_id", user.id)
      .eq("status", "delivered")
      .then(({ data }) => {
        if (data) {
          setDeliveryCount(data.length);
          setCo2Offset(data.reduce((sum, o) => sum + Number(o.weight) * 0.15, 0));
        }
      });
  }, [user?.id]);

  if (!user) return null;

  const treesEquiv = Math.round(co2Offset / 22);

  return (
    <div className="page-fade min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-[#050507] dark:text-[#ede9f8]">
      <CustomerTopBar />

      <main className="flex flex-1 flex-col">
        {/* Hero / heading */}
        <section className="border-b border-slate-200 bg-[rgba(62,0,116,0.15)] px-8 py-16 md:py-20 dark:border-[#221d38] dark:bg-[rgba(192,132,252,0.08)]">
          <div className="mx-auto max-w-screen-2xl">
            <div className="flex flex-col items-end gap-8 md:flex-row md:justify-between">
              <div className="max-w-3xl">
                <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-primary">
                  Environmental Analysis V1.0
                </p>
                <h1 className="text-5xl font-black uppercase leading-none tracking-[-0.05em] text-primary md:text-7xl lg:text-8xl">
                  Impact
                  <br />
                  Report
                </h1>
                <p className="mt-8 max-w-xl text-xl font-medium leading-relaxed text-primary/80 dark:text-zinc-300">
                  Quantifying the carbon reduction and ecological contribution
                  of our high-efficiency delivery network. Your personal impact
                  from {deliveryCount} deliveries.
                </p>
              </div>
              <div className="flex w-full flex-col gap-4 border-l-4 border-primary pl-6 md:w-auto md:py-4">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-[#9d8ab8]">
                  Your Deliveries
                </span>
                <span className="text-2xl font-bold uppercase tracking-tight text-primary">
                  {deliveryCount} Completed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Top stats — YOUR personal impact */}
        <section className="grid grid-cols-1 border-b border-slate-200 md:grid-cols-3 dark:border-[#221d38]">
          <div className="flex min-h-[260px] flex-col justify-between border-b border-slate-200 bg-white p-8 md:border-b-0 md:border-r dark:border-[#221d38] dark:bg-[#0c0b14]">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400 dark:text-[#8b7aaa]">
              Your CO2 Offset
            </span>
            <div>
              <p className="stat-value text-5xl font-black uppercase tracking-[-0.05em] text-primary md:text-6xl">
                {co2Offset.toFixed(1)}
              </p>
              <p className="text-sm font-bold uppercase text-primary/60 dark:text-zinc-400">
                Kilograms Carbon
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-600">
              <span className="material-symbols-outlined text-sm">eco</span>
              Every delivery counts
            </div>
          </div>

          <div className="checkerboard flex min-h-[260px] flex-col justify-between border-b border-slate-200 bg-slate-50 p-8 md:border-b-0 md:border-r dark:border-[#221d38] dark:bg-[#050507]">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400 dark:text-[#8b7aaa]">
              Trees Equivalent
            </span>
            <div>
              <p className="stat-value text-5xl font-black uppercase tracking-[-0.05em] text-accent md:text-6xl">
                {treesEquiv}
              </p>
              <p className="text-sm font-bold uppercase text-accent/80">
                Active Saplings
              </p>
            </div>
            <div className="mt-6">
              <div className="h-1 w-full overflow-hidden bg-slate-200 sharp-edge dark:bg-[#221d38]">
                <div className="h-full bg-accent" style={{ width: `${Math.min((treesEquiv / 100) * 100, 100)}%` }} />
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-[#8b7aaa]">
                Personal Forestry Goal
              </p>
            </div>
          </div>

          <div className="flex min-h-[260px] flex-col justify-between bg-white p-8 dark:bg-[#0c0b14]">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400 dark:text-[#8b7aaa]">
              Green Deliveries
            </span>
            <div>
              <p className="stat-value text-5xl font-black uppercase tracking-[-0.05em] text-primary md:text-6xl">
                {deliveryCount}
              </p>
              <p className="text-sm font-bold uppercase text-primary/60 dark:text-zinc-400">
                Zero-Emission Deliveries
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <div className="h-10 w-1 bg-primary" />
              <div className="h-10 w-1 bg-primary/60" />
              <div className="h-10 w-1 bg-primary/30" />
              <div className="h-10 w-1 bg-accent" />
            </div>
          </div>
        </section>

        {/* Chart + efficiency */}
        <section className="grid grid-cols-1 bg-white lg:grid-cols-2 dark:bg-[#0c0b14]">
          <div className="border-b border-r border-slate-200 p-8 md:p-12 dark:border-[#221d38]">
            <div className="mb-12 flex items-start justify-between">
              <div>
                <h3 className="mb-2 text-2xl font-black uppercase tracking-tight text-primary">
                  CO2 Savings Projection
                </h3>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-[#8b7aaa]">
                  Temporal Analysis (Metric Tons / Month)
                </p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-[#9d8ab8]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 bg-primary sharp-edge" /> Actual
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 bg-accent sharp-edge" /> Target
                </span>
              </div>
            </div>
            <div className="relative h-[340px] w-full border-b border-l border-slate-300 grid-line dark:border-[#302555]">
              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 1000 400"
              >
                <polyline
                  fill="none"
                  stroke="#ff9b16"
                  strokeWidth="2"
                  strokeDasharray="10,5"
                  points="0,350 200,320 400,280 600,220 800,150 1000,100"
                />
                <polyline
                  fill="none"
                  className="stroke-[#3e0074] dark:stroke-[#c084fc]"
                  strokeWidth="6"
                  points="0,380 150,340 300,350 450,290 600,210 750,180 900,140 1000,80"
                />
                <circle cx="150" cy="340" r="6" className="fill-[#3e0074] dark:fill-[#c084fc]" />
                <circle cx="450" cy="290" r="6" className="fill-[#3e0074] dark:fill-[#c084fc]" />
                <circle cx="750" cy="180" r="6" className="fill-[#3e0074] dark:fill-[#c084fc]" />
                <circle cx="1000" cy="80" r="6" className="fill-[#3e0074] dark:fill-[#c084fc]" />
              </svg>
              <div className="absolute -bottom-7 flex w-full justify-between text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-[#8b7aaa]">
                <span>JAN</span>
                <span>MAR</span>
                <span>MAY</span>
                <span>JUL</span>
                <span>SEP</span>
                <span>NOV</span>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50 p-8 md:p-12 dark:border-[#221d38] dark:bg-[#050507]">
            <div className="mb-12 flex items-start justify-between">
              <div>
                <h3 className="mb-2 text-2xl font-black uppercase tracking-tight text-primary">
                  Network Efficiency
                </h3>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-[#8b7aaa]">
                  Energy Usage per 1000 Deliveries (kWh)
                </p>
              </div>
              <span className="material-symbols-outlined text-primary">
                analytics
              </span>
            </div>
            <div className="space-y-6">
              {[
                { label: "E-Cargo Bike", width: "w-[15%]", value: "12.4 kWh" },
                { label: "EV Sedan", width: "w-[45%]", value: "48.9 kWh" },
                {
                  label: "EV Heavy Van",
                  width: "w-[85%]",
                  value: "92.1 kWh",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-6 text-xs font-bold"
                >
                  <span className="w-24 text-[11px] uppercase">
                    {item.label}
                  </span>
                  <div className="flex flex-1 items-center border border-slate-200 bg-white sharp-edge dark:border-[#221d38] dark:bg-[#0c0b14]">
                    <div className={`h-12 bg-primary ${item.width}`} />
                    <span className="ml-4 text-xs font-bold text-primary">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}

              <div className="mt-4 flex items-center gap-6 text-xs font-bold">
                <span className="w-24 text-[11px] uppercase italic text-slate-400 dark:text-[#8b7aaa]">
                  Industry Std.
                </span>
                <div className="flex flex-1 items-center border border-dashed border-slate-300 bg-white sharp-edge dark:border-[#302555] dark:bg-[#0c0b14]">
                  <div className="h-12 w-full bg-slate-200 dark:bg-[#221d38]" />
                  <span className="ml-4 text-xs font-bold text-slate-400 dark:text-[#8b7aaa]">
                    210.0 kWh
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Telemetry table */}
        <section className="border-b border-slate-200 bg-[rgba(62,0,116,0.15)] p-8 md:p-12 dark:border-[#221d38] dark:bg-[rgba(192,132,252,0.08)]">
          <h3 className="mb-10 text-2xl font-black uppercase tracking-tight text-primary">
            System Telemetry Log
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-bold">
              <thead>
                <tr className="border-b-2 border-primary text-[10px] uppercase tracking-[0.22em] text-primary">
                  <th className="py-3">Region ID</th>
                  <th className="py-3">Active Units</th>
                  <th className="py-3">Energy Mix</th>
                  <th className="py-3">Offset (KG)</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {[
                  [
                    "LDN-CENTRAL-01",
                    "482 Units",
                    "100% Wind/Solar",
                    "14,209.4",
                  ],
                  [
                    "MNCR-WEST-04",
                    "215 Units",
                    "85% Hydro/Renewable",
                    "8,441.2",
                  ],
                  ["BRST-SOUTH-09", "128 Units", "92% Wind", "5,110.8"],
                  ["EDIN-NORTH-02", "304 Units", "100% Wind", "11,902.1"],
                ].map((row) => (
                  <tr key={row[0]}>
                    <td className="py-5">{row[0]}</td>
                    <td className="py-5">{row[1]}</td>
                    <td className="py-5">{row[2]}</td>
                    <td className="py-5">{row[3]}</td>
                    <td className="py-5">
                      <span className="bg-primary px-2 py-1 text-[10px] uppercase text-white sharp-edge">
                        PEAK PERFORMANCE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="bg-primary px-8 py-12 text-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-white">
                eco
              </span>
              <span className="text-2xl font-black uppercase tracking-tighter">
                EcoQuick
              </span>
            </div>
            <p className="mb-8 text-sm font-medium leading-relaxed text-white/60">
              Engineering a carbon-neutral future through algorithmic route
              optimization and 100% electric logistics infrastructure.
            </p>
            <div className="flex gap-4">
              {["terminal", "data_object", "lan"].map((icon) => (
                <button
                  key={icon}
                  className="border border-white/20 p-2 sharp-edge transition-colors hover:bg-white/20"
                >
                  <span className="material-symbols-outlined text-sm">
                    {icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 md:grid-cols-3">
            <div>
              <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Framework
              </h4>
              <ul className="space-y-4 text-xs font-bold uppercase">
                <li>
                  <a className="hover:underline" href="#">
                    Methodology
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#">
                    Data Sources
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#">
                    API Access
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Standards
              </h4>
              <ul className="space-y-4 text-xs font-bold uppercase">
                <li>
                  <a className="hover:underline" href="#">
                    ISO 14064
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#">
                    GHG Protocol
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#">
                    SBTi Target
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:col-span-1">
              <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Certification
              </h4>
              <div className="border border-white/20 p-4 sharp-edge">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent italic">
                  Verified Impact
                </div>
                <div className="text-lg font-black leading-tight">
                  ECO-CERT ALPHA-9
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-screen-2xl items-center justify-between border-t border-white/10 pt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
          <span>© 2025 EcoQuick Infrastructure</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 bg-emerald-400 sharp-edge" />
            Node 07-B Active
          </span>
        </div>
      </footer>

      <CustomerMobileNav />
    </div>
  );
}

