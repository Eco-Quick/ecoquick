"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CompletedOrder {
  id: string;
  total_price: number;
  weight: number;
  delivered_at: string;
  scheduling_type: string;
  pickup_city: string;
  delivery_city: string;
}

export default function DriverEarningsPage() {
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  async function fetchEarnings() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("delivery_orders")
      .select("id, total_price, weight, delivered_at, scheduling_type, pickup_city, delivery_city")
      .eq("driver_id", user.id)
      .eq("status", "delivered")
      .order("delivered_at", { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  // Calculate stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

  const todayOrders = orders.filter((o) => new Date(o.delivered_at) >= todayStart);
  const weekOrders = orders.filter((o) => new Date(o.delivered_at) >= weekStart);

  const driverShare = 0.8;
  const todayEarnings = todayOrders.reduce((s, o) => s + Number(o.total_price) * driverShare, 0);
  const weekEarnings = weekOrders.reduce((s, o) => s + Number(o.total_price) * driverShare, 0);
  const weekDeliveries = weekOrders.length;
  const avgPerTrip = weekDeliveries > 0 ? weekEarnings / weekDeliveries : 0;
  const co2Saved = orders.reduce((s, o) => s + Number(o.weight) * 0.15, 0);

  // Daily earnings for bar chart (Mon–Sun)
  const dailyEarnings = [0, 0, 0, 0, 0, 0, 0];
  weekOrders.forEach((o) => {
    const day = new Date(o.delivered_at).getDay();
    const idx = day === 0 ? 6 : day - 1; // Monday=0 ... Sunday=6
    dailyEarnings[idx] += Number(o.total_price) * driverShare;
  });
  const maxDaily = Math.max(...dailyEarnings, 1);

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="p-6 pb-20 md:p-12">
      {/* Header */}
      <section className="mb-12 flex flex-col items-start gap-6 border-b-2 border-primary pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-black uppercase tracking-tighter text-primary text-4xl md:text-6xl">
            Earnings
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            This week&apos;s performance
          </p>
        </div>
      </section>

      {/* Stats grid */}
      <section className="mb-12 grid grid-cols-2 gap-0 border-2 border-primary lg:grid-cols-4">
        <div className="flex flex-col justify-between border-r border-b border-primary/20 bg-white p-8 dark:bg-[#0c0b14]">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Today&apos;s Earnings</p>
          <p className="mt-4 font-secondary text-4xl font-black text-primary">£{todayEarnings.toFixed(2)}</p>
        </div>
        <div className="flex flex-col justify-between border-b border-primary/20 bg-primary p-8 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60">Week Deliveries</p>
          <p className="mt-4 font-secondary text-4xl font-black">{weekDeliveries}</p>
        </div>
        <div className="flex flex-col justify-between border-r border-primary/20 bg-primary p-8 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60">Week Earnings</p>
          <p className="mt-4 font-secondary text-4xl font-black">£{weekEarnings.toFixed(2)}</p>
        </div>
        <div className="flex flex-col justify-between bg-white p-8 dark:bg-[#0c0b14]">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Avg. Per Trip</p>
          <p className="mt-4 font-secondary text-4xl font-black text-primary">£{avgPerTrip.toFixed(2)}</p>
        </div>
      </section>

      {/* Chart + side stats */}
      <section className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-8 text-2xl font-black uppercase tracking-tight text-primary">Performance Graph</h3>
          <div className="flex h-64 items-end justify-between gap-4 border-b-2 border-primary pb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const pct = (dailyEarnings[i] / maxDaily) * 100;
              return (
                <div key={day} className="flex w-full flex-col items-center gap-4">
                  <div
                    className={`w-full transition-all ${pct > 0 ? "bg-primary" : "bg-primary/10"}`}
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                  <span className="text-[10px] font-bold uppercase">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col justify-end gap-6">
          <div className="border border-primary/20 bg-white p-8 dark:bg-[#0c0b14]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Carbon Saved</p>
            <p className="font-secondary text-4xl font-black text-emerald-600">{co2Saved.toFixed(1)}kg</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-accent">
              Equivalent to {Math.round(co2Saved / 22)} trees
            </p>
          </div>
          <div className="border border-primary/20 bg-white p-8 dark:bg-[#0c0b14]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Deliveries</p>
            <p className="font-secondary text-4xl font-black text-primary">{orders.length}</p>
          </div>
        </div>
      </section>

      {/* Completed deliveries table */}
      <section>
        <h3 className="mb-8 text-2xl font-black uppercase tracking-tight text-primary">Completed Deliveries</h3>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-slate-300 py-16 dark:border-zinc-700">
            <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">No completed deliveries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-t-2 border-primary">
              <thead>
                <tr className="border-b border-primary/10 text-left">
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Order</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Route</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-4 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {orders.slice(0, 20).map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-primary/[0.02]">
                    <td className="px-4 py-6">
                      <div className="text-lg font-black text-primary">EQ-{order.id.slice(0, 6).toUpperCase()}</div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        {order.scheduling_type === "instant" ? "Express" : "Scheduled"}
                      </div>
                    </td>
                    <td className="px-4 py-6 text-sm font-medium text-slate-600 dark:text-zinc-300">
                      {order.pickup_city} → {order.delivery_city}
                    </td>
                    <td className="px-4 py-6">
                      <div className="text-sm font-bold">{formatDate(order.delivered_at)}</div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">{formatTime(order.delivered_at)}</div>
                    </td>
                    <td className="px-4 py-6 text-right text-xl font-black text-primary">
                      £{(Number(order.total_price) * driverShare).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
