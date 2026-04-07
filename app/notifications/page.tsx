"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { CustomerMobileNav } from "@/components/layout/CustomerMobileNav";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  order_id: string | null;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  order_confirmed: "check_circle",
  driver_assigned: "person",
  picked_up: "local_mall",
  in_transit: "local_shipping",
  delivered: "task_alt",
  payment_received: "payments",
};

export default function NotificationsPage() {
  const user = useCustomerAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    const supabase = createClient();
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  async function fetchNotifications() {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) setNotifications(data);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function markAllRead() {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  function timeAgo(dateStr: string) {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="page-fade flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-[#0d0916] dark:text-[#ede9f8]">
      <CustomerTopBar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#7c6d99]">
              Inbox
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-primary">
              Notifications
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined mb-4 text-5xl text-slate-200 dark:text-zinc-700">
              notifications_none
            </span>
            <p className="text-sm font-semibold text-slate-500 dark:text-[#8b7aaa]">You&apos;re all caught up.</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-[#7c6d99]">
              Order updates and alerts will appear here.
            </p>
            <Link
              href="/book/type"
              className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline"
            >
              Book a delivery
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) markAsRead(notif.id);
                }}
                className={`flex w-full items-start gap-4 border px-6 py-5 text-left transition-colors ${
                  notif.is_read
                    ? "border-slate-100 bg-white dark:border-zinc-800 dark:bg-[#161027]"
                    : "border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${
                  notif.is_read ? "bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500" : "bg-primary text-white"
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {TYPE_ICONS[notif.type] ?? "notifications"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <p className={`text-sm font-bold ${
                      notif.is_read ? "text-slate-600 dark:text-zinc-300" : "text-primary"
                    }`}>
                      {notif.title}
                    </p>
                    <span className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{notif.body}</p>
                </div>
                {!notif.is_read && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      <CustomerMobileNav />
    </div>
  );
}
