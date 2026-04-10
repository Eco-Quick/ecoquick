"use client";

import { usePathname, useRouter } from "next/navigation";
import { CUSTOMER_MOBILE_NAV } from "@/lib/nav-config";

export function CustomerMobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-[#050507]/90 md:hidden">
      {CUSTOMER_MOBILE_NAV.map((item) => {
        const isActive = item.match(pathname);
        return (
          <button
            key={item.href}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              isActive
                ? "text-[#3e0074] dark:text-[#c084fc]"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
            onClick={() => router.push(item.href)}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
