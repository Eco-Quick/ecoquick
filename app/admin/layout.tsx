import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 dark:bg-[#050507] dark:text-[#ede9f8]">
      <AdminSidebar adminEmail={admin.email} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
