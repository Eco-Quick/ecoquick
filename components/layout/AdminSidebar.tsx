"use client";

import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { ADMIN_SIDEBAR_NAV } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-primary bg-white dark:bg-[#050507] dark:border-[#4c1d95] lg:flex">
      <div className="border-b border-primary dark:border-[#4c1d95] p-6">
        <BrandLogo size="sm" labelSuffix="Admin" />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {ADMIN_SIDEBAR_NAV.map((item) => (
          <button
            key={item.href}
            className={`flex w-full items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest sharp-edge ${
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
      <div className="border-t border-primary/20 dark:border-[#4c1d95]/40 p-4">
        <p className="mb-2 truncate text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {adminEmail}
        </p>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
