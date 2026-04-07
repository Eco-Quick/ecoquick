"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BrandLogo } from "./BrandLogo";
import { CUSTOMER_TOP_NAV } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNotificationCount } from "@/hooks/useNotificationCount";

export function CustomerTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const notifCount = useNotificationCount(userId);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-[#0d0916]/85">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
        {/* Left: logo */}
        <div className="flex items-center">
          <button onClick={() => router.push("/dashboard")}>
            <BrandLogo size="sm" />
          </button>
        </div>

        {/* Center: nav */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex">
          {CUSTOMER_TOP_NAV.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                item.match(pathname)
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
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700 active:scale-90 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            onClick={() => router.push("/notifications")}
          >
            <span className="material-symbols-outlined text-base">notifications</span>
            {notifCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>
          <button
            className="hidden h-9 items-center rounded-full border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:border-red-300 hover:text-red-600 active:scale-95 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-800 dark:hover:text-red-400 sm:inline-flex"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
