"use client";

import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { CustomerMobileNav } from "@/components/layout/CustomerMobileNav";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import Link from "next/link";

export default function NotificationsPage() {
  const user = useCustomerAuth();
  if (!user) return null;

  return (
    <div className="page-fade flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <CustomerTopBar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          Inbox
        </p>
        <h1 className="mb-8 text-3xl font-black uppercase tracking-tight text-primary">
          Notifications
        </h1>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined mb-4 text-5xl text-slate-200">
            notifications_none
          </span>
          <p className="text-sm font-semibold text-slate-500">You&apos;re all caught up.</p>
          <p className="mt-1 text-xs text-slate-400">
            Order updates and alerts will appear here.
          </p>
          <Link
            href="/book/type"
            className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline"
          >
            Book a delivery
          </Link>
        </div>
      </main>

      <CustomerMobileNav />
    </div>
  );
}
