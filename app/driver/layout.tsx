"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/driver", label: "Overview", icon: "dashboard" },
  { href: "/driver/jobs", label: "Jobs", icon: "search" },
  { href: "/driver/track", label: "Active", icon: "local_shipping" },
  { href: "/driver/earnings", label: "Earnings", icon: "account_balance_wallet" },
];

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
    <div className="flex min-h-screen flex-col bg-zinc-50 text-slate-900 dark:bg-[#050507] dark:text-[#ede9f8]">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-[#050507]/85">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          {/* Left: logo */}
          <div className="flex items-center">
            <button onClick={() => router.push("/driver")}>
              <BrandLogo size="sm" labelSuffix="Driver" />
            </button>
          </div>

          {/* Center: nav */}
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-[#3e0074]/10 text-[#3e0074] dark:bg-[#c084fc]/10 dark:text-[#c084fc]"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: actions */}
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <button
              className="hidden h-9 items-center rounded-full border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:border-red-300 hover:text-red-600 active:scale-95 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-800 dark:hover:text-red-400 sm:inline-flex"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-[#050507]/90 md:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.href}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              isActive(item.href)
                ? "text-[#3e0074] dark:text-[#c084fc]"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
            onClick={() => router.push(item.href)}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
