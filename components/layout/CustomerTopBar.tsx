"use client";

import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { CUSTOMER_TOP_NAV } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

export function CustomerTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const linkBase =
    "nav-tab text-[11px] sm:text-sm font-semibold tracking-[0.08em] transition-colors active:scale-95 active:opacity-75";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 py-3 backdrop-blur dark:border-zinc-800 dark:bg-[#0d0916]/85">
      <div className="relative mx-auto flex max-w-6xl items-center gap-4 px-5 sm:px-6">
        <div className="flex items-center">
          <button onClick={() => router.push("/dashboard")}>
            <BrandLogo size="md" />
          </button>
        </div>

        <nav className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-6 text-zinc-500 md:flex">
          {CUSTOMER_TOP_NAV.map((item) =>
            item.match(pathname) ? (
              <span
                key={item.href}
                className={`${linkBase} nav-tab-active text-primary`}
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`${linkBase} text-zinc-600 hover:text-primary`}
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <button
            aria-label="Notifications"
            title="Notifications"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 shadow-[0_0_0_1px_rgba(0,0,0,0.02)] transition hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 active:scale-90 dark:border-zinc-700 dark:bg-[#161027] dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200 sm:flex"
            onClick={() => router.push("/notifications")}
          >
            <span className="material-symbols-outlined text-base">
              notifications
            </span>
          </button>
          <button
            className="btn-sweep hidden h-9 items-center rounded-full border border-zinc-300 px-3 text-sm font-medium text-zinc-700 transition hover:border-[#3f0075] hover:bg-[#3f0075] hover:text-white active:scale-95 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-[#c084fc] dark:hover:bg-[#3f0075] dark:hover:text-white sm:inline-flex"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
