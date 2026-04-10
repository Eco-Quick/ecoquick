"use client";

import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { CUSTOMER_SIDEBAR_NAV } from "@/lib/nav-config";

export function CustomerSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-primary bg-white dark:bg-[#050507] dark:border-[#4c1d95] lg:flex">
      <div className="border-b border-primary dark:border-[#4c1d95] p-6">
        <BrandLogo size="sm" />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {CUSTOMER_SIDEBAR_NAV.map((item) => (
          <button
            key={item.href}
            className={`flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest sharp-edge ${
              item.match(pathname)
                ? "bg-primary text-white"
                : "text-primary transition-all hover:bg-primary/5"
            }`}
            onClick={() => router.push(item.href)}
          >
            <span className="material-symbols-outlined text-lg text-accent">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
