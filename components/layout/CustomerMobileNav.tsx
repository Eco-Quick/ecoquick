"use client";

import { usePathname, useRouter } from "next/navigation";
import { CUSTOMER_MOBILE_NAV } from "@/lib/nav-config";

export function CustomerMobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const baseClasses =
    "flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-widest transition-opacity duration-150";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-accent/20 bg-primary px-2 text-white dark:border-zinc-800 dark:bg-[#0d0916] lg:hidden">
      {CUSTOMER_MOBILE_NAV.map((item) => {
        const isActive = item.match(pathname);
        return (
          <button
            key={item.href}
            className={`${baseClasses} ${isActive ? "text-accent" : "opacity-70 hover:opacity-90"}`}
            onClick={() => router.push(item.href)}
          >
            <div
              className="mobile-nav-tap"
              data-active={isActive ? "true" : "false"}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
            </div>
            <span className="transition-colors duration-150">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
