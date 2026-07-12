import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminActivityBell } from "@/components/admin/AdminActivityBell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 dark:bg-[#050507] dark:text-[#ede9f8]">
      <AdminSidebar adminEmail={admin.email} />
      <main className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-end border-b border-slate-200 bg-zinc-50/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-[#050507]/80">
          <AdminActivityBell />
        </header>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
