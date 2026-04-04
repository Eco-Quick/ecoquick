"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DriverDashboardPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [driverName, setDriverName] = useState<string>("EcoQuick Driver");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setDriverName(user.user_metadata.full_name);
      }
    });
  }, []);

  const handleNotificationsClick = () => {
    setShowNotificationToast(true);
    window.setTimeout(() => {
      setShowNotificationToast(false);
    }, 2000);
  };

  const onlineLabel = isOnline ? "ONLINE" : "OFFLINE";

  return (
    <div className="p-12">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-primary">
              Hello, {driverName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your deliveries and track earnings today.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button
              className="p-2 text-slate-400 transition-colors hover:text-primary"
              onClick={handleNotificationsClick}
            >
              <span className="material-symbols-outlined text-2xl">
                notifications
              </span>
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <button
              className="flex items-center gap-3 bg-primary px-8 py-3 text-xs font-bold tracking-widest text-white"
              onClick={() => setIsOnline((prev) => !prev)}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isOnline ? "bg-green-400" : "bg-slate-400"
                }`}
              />
              {onlineLabel}
            </button>
          </div>
        </header>

        {showNotificationToast && (
          <div className="fixed right-8 top-20 z-50 rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
            No new notifications.
          </div>
        )}

        <section className="mb-12 grid grid-cols-2 border border-slate-200 lg:grid-cols-4">
          <div className="flex h-48 flex-col justify-between border-r border-b border-slate-200 bg-primary p-8 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              Today&apos;s Earnings
            </span>
            <div>
              <span className="block text-4xl font-bold tracking-tighter">
                £142.00
              </span>
              <span className="text-[10px] font-bold text-emerald-300">
                +12% from yesterday
              </span>
            </div>
          </div>
          <div className="flex h-48 flex-col justify-between border-r border-b border-slate-200 bg-white p-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Deliveries Today
            </span>
            <div>
              <span className="block text-4xl font-bold tracking-tighter text-primary">
                12
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                2 pending completion
              </span>
            </div>
          </div>
          <div className="flex h-48 flex-col justify-between border-r border-b border-slate-200 bg-primary p-8 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              Driver Rating
            </span>
            <div>
              <span className="block text-4xl font-bold tracking-tighter">
                4.92
              </span>
              <div className="mt-1 flex gap-1">
                <span className="material-symbols-outlined text-xs text-yellow-400">
                  star
                </span>
                <span className="material-symbols-outlined text-xs text-yellow-400">
                  star
                </span>
                <span className="material-symbols-outlined text-xs text-yellow-400">
                  star
                </span>
                <span className="material-symbols-outlined text-xs text-yellow-400">
                  star
                </span>
                <span className="material-symbols-outlined text-xs text-yellow-400">
                  star_half
                </span>
              </div>
            </div>
          </div>
          <div className="flex h-48 flex-col justify-between border-b border-slate-200 bg-white p-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Active Orders
            </span>
            <div>
              <span className="block text-4xl font-bold tracking-tighter text-primary">
                03
              </span>
              <span className="text-[10px] font-bold text-primary">
                Priority dispatch
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-0 border border-slate-200 lg:grid-cols-3">
          <div className="border-r border-slate-200 lg:col-span-1">
            <div className="border-b border-slate-200 bg-slate-50 p-8">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                Quick Actions
              </h2>
            </div>
            <div className="divide-y divide-slate-200">
              <button className="group flex w-full items-center justify-between p-8 transition-all duration-300 hover:bg-primary hover:text-white">
                <div className="flex items-center gap-6">
                  <span className="material-symbols-outlined text-2xl text-accent group-hover:text-white">
                    explore
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest">
                    Find Deliveries
                  </span>
                </div>
                <span className="material-symbols-outlined transform text-xl opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                  arrow_forward
                </span>
              </button>
              <button className="group flex w-full items-center justify-between p-8 transition-all duration-300 hover:bg-primary hover:text-white">
                <div className="flex items-center gap-6">
                  <span className="material-symbols-outlined text-2xl text-accent group-hover:text-white">
                    list_alt
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest">
                    Active Orders
                  </span>
                </div>
                <span className="material-symbols-outlined transform text-xl opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                  arrow_forward
                </span>
              </button>
              <button className="group flex w-full items-center justify-between p-8 transition-all duration-300 hover:bg-primary hover:text-white">
                <div className="flex items-center gap-6">
                  <span className="material-symbols-outlined text-2xl text-accent group-hover:text-white">
                    receipt_long
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest">
                    View Earnings
                  </span>
                </div>
                <span className="material-symbols-outlined transform text-xl opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-8">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                Today&apos;s Summary
              </h2>
              <span className="text-[10px] font-medium text-slate-400">
                Last updated: Just now
              </span>
            </div>
            <div className="p-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Metric
                    </th>
                    <th className="pb-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-6 text-sm font-medium">
                      Deliveries Completed
                    </td>
                    <td className="py-6 text-right text-sm font-bold text-primary">
                      12
                    </td>
                  </tr>
                  <tr>
                    <td className="py-6 text-sm font-medium">
                      Total Distance Traveled
                    </td>
                    <td className="py-6 text-right text-sm font-bold text-primary">
                      48.2 km
                    </td>
                  </tr>
                  <tr>
                    <td className="py-6 text-sm font-medium">
                      Average Earnings per Delivery
                    </td>
                    <td className="py-6 text-right text-sm font-bold text-primary">
                      £11.83
                    </td>
                  </tr>
                  <tr>
                    <td className="py-6 text-sm font-medium">
                      Active Driving Time
                    </td>
                    <td className="py-6 text-right text-sm font-bold text-primary">
                      5h 22m
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-8 flex gap-4">
                <div className="flex-1 border border-slate-200 p-6">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    CO2 Saved
                  </span>
                  <span className="text-2xl font-bold text-emerald-600">
                    4.2 kg
                  </span>
                </div>
                <div className="flex-1 border border-slate-200 p-6">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Bonuses Earned
                  </span>
                  <span className="text-2xl font-bold text-primary">£15.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 flex flex-col items-center justify-between gap-8 border-t border-slate-200 pt-12 text-[11px] font-bold uppercase tracking-widest text-slate-400 lg:flex-row">
          <div className="flex items-center gap-12">
            <button
              className="transition-colors hover:text-primary"
              onClick={() => router.push("/about")}
            >
              About Us
            </button>
            <button
              className="transition-colors hover:text-primary"
              onClick={() => router.push("/help")}
            >
              Privacy Policy
            </button>
            <button
              className="transition-colors hover:text-primary"
              onClick={() => router.push("/help")}
            >
              Terms of Service
            </button>
            <button
              className="transition-colors hover:text-primary"
              onClick={() => router.push("/help")}
            >
              Help Center
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 border border-emerald-100 bg-emerald-50 px-4 py-2">
              <span className="material-symbols-outlined text-sm text-emerald-600">
                verified_user
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Secure &amp; Encrypted
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              © 2026 EcoQuick. All rights reserved.
            </p>
          </div>
        </footer>

      <button className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center bg-primary text-white shadow-xl transition-colors hover:bg-slate-800">
        <span className="material-symbols-outlined text-2xl">chat_bubble</span>
      </button>
    </div>
  );
}

