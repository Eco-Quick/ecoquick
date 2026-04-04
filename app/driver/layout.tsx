"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DriverLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900 dark:bg-[#0d0916] dark:text-[#ede9f8]">
      <aside className="fixed inset-y-0 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0d0916] lg:flex">
        <div className="p-8">
          <div className="mb-12">
            <BrandLogo size="sm" labelSuffix="Driver" />
          </div>
          <nav className="space-y-10">
            <div>
              <h3 className="mb-6 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Work &amp; Performance
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive("/driver")
                        ? "active-nav text-primary"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => router.push("/driver")}
                  >
                    <span className="material-symbols-outlined text-xl text-accent">
                      dashboard
                    </span>
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive("/driver/jobs")
                        ? "active-nav text-primary"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => router.push("/driver/jobs")}
                  >
                    <span className="material-symbols-outlined text-xl text-accent">
                      search
                    </span>
                    Available Jobs
                  </button>
                </li>
                <li>
                  <button
                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive("/driver/track")
                        ? "active-nav text-primary"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => router.push("/driver/track")}
                  >
                    <span className="material-symbols-outlined text-xl text-accent">
                      local_shipping
                    </span>
                    My Orders
                  </button>
                </li>
                <li>
                  <button
                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive("/driver/earnings")
                        ? "active-nav text-primary"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => router.push("/driver/earnings")}
                  >
                    <span className="material-symbols-outlined text-xl text-accent">
                      account_balance_wallet
                    </span>
                    Earnings
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-6 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Profile &amp; Vehicle
              </h3>
              <ul className="space-y-1">
                <li>
                  <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50">
                    <span className="material-symbols-outlined text-xl text-accent">
                      person_outline
                    </span>
                    Driver Profile
                  </button>
                </li>
                <li>
                  <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50">
                    <span className="material-symbols-outlined text-xl text-accent">
                      description
                    </span>
                    Documents
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="mt-auto border-t border-slate-200 dark:border-zinc-800 p-8 space-y-4">
          <ThemeToggle className="w-full justify-start gap-3 px-3 h-10 rounded-none" />
          <button
            className="flex w-full items-center gap-3 text-sm font-medium text-slate-500 transition-colors hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
            onClick={handleSignOut}
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-primary/20 bg-white px-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 dark:border-zinc-800 dark:bg-[#0d0916] dark:text-zinc-400 lg:hidden">
        <button
          className={`flex flex-col items-center gap-0.5 ${
            isActive("/driver") ? "text-primary" : "opacity-70"
          }`}
          onClick={() => router.push("/driver")}
        >
          <span className="material-symbols-outlined text-lg">dashboard</span>
          <span>Home</span>
        </button>
        <button
          className={`flex flex-col items-center gap-0.5 ${
            isActive("/driver/jobs") ? "text-primary" : "opacity-70"
          }`}
          onClick={() => router.push("/driver/jobs")}
        >
          <span className="material-symbols-outlined text-lg">search</span>
          <span>Jobs</span>
        </button>
        <button
          className={`flex flex-col items-center gap-0.5 ${
            isActive("/driver/track") ? "text-primary" : "opacity-70"
          }`}
          onClick={() => router.push("/driver/track")}
        >
          <span className="material-symbols-outlined text-lg">
            local_shipping
          </span>
          <span>Active</span>
        </button>
        <button
          className={`flex flex-col items-center gap-0.5 ${
            isActive("/driver/earnings") ? "text-primary" : "opacity-70"
          }`}
          onClick={() => router.push("/driver/earnings")}
        >
          <span className="material-symbols-outlined text-lg">
            account_balance_wallet
          </span>
          <span>Earn</span>
        </button>
      </nav>
    </div>
  );
}

