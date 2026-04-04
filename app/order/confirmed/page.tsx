"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  status: string;
  scheduling_type: string;
  created_at: string;
  customer_id: string;
  pickup_address: string;
  pickup_postcode: string;
  pickup_city: string;
  delivery_address: string;
  delivery_postcode: string;
  delivery_city: string;
  total_price: number;
  base_price: number;
  size_fee: number;
  scheduling_fee: number;
  discount_amount: number;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
}

function formatStatus(status: string) {
  const map: Record<string, string> = {
    pending: "Awaiting confirmation",
    confirmed: "Confirmed",
    in_transit: "In transit",
    picked_up: "Picked up",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] ?? status.replace("_", " ");
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<OrderConfirmedFallback />}>
      <OrderConfirmedContent />
    </Suspense>
  );
}

function OrderConfirmedFallback() {
  return (
    <div className="page-fade flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <CustomerTopBar />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <p className="text-sm text-slate-500">Loading order…</p>
      </main>
    </div>
  );
}

function OrderConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useCustomerAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [fetchError, setFetchError] = useState(false);

  const orderId = searchParams.get("id");

  useEffect(() => {
    if (!orderId) {
      setFetchError(true);
      return;
    }
    const supabase = createClient();
    supabase
      .from("delivery_orders")
      .select(
        "id, status, scheduling_type, created_at, customer_id, pickup_address, pickup_postcode, pickup_city, delivery_address, delivery_postcode, delivery_city, total_price, base_price, size_fee, scheduling_fee, discount_amount"
      )
      .eq("id", orderId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setFetchError(true);
          return;
        }
        // Ownership check — belt-and-suspenders on top of RLS
        if (user && data.customer_id !== user.id) {
          setFetchError(true);
          return;
        }
        setOrder(data);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!user) return null;

  if (fetchError) {
    return (
      <div className="page-fade flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <CustomerTopBar />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <span className="material-symbols-outlined mb-4 text-5xl text-slate-300">
            receipt_long
          </span>
          <h1 className="mb-2 text-xl font-black uppercase tracking-tight text-primary">
            Order not found
          </h1>
          <p className="mb-6 text-sm text-slate-500">
            We couldn&apos;t load the details for this order.
          </p>
          <Link
            href="/orders"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline"
          >
            View all orders
          </Link>
        </main>
      </div>
    );
  }

  const confirmationId = order ? `EQ-${order.id.slice(0, 6).toUpperCase()}` : "—";
  const isInstant = order?.scheduling_type !== "scheduled";

  const createdAt = order ? new Date(order.created_at) : null;
  const pickupTime = createdAt ? new Date(createdAt.getTime() + 45 * 60 * 1000) : null;
  const deliveryTime = createdAt ? new Date(createdAt.getTime() + 90 * 60 * 1000) : null;

  const route = order
    ? `${order.pickup_postcode || order.pickup_city || order.pickup_address} → ${order.delivery_postcode || order.delivery_city || order.delivery_address}`
    : "—";

  return (
    <div className="page-fade flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <CustomerTopBar />

      {/* Main */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-white px-6 py-16 md:py-20">
        <div className="architectural-grid pointer-events-none absolute inset-0" />
        <div className="relative z-10 w-full max-w-xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full bg-primary/5 blur-3xl" />
              <span className="material-symbols-outlined success-checkmark">
                check_circle
              </span>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-black uppercase tracking-tight text-primary sm:text-4xl">
            Order Confirmed
          </h1>
          <p className="mx-auto mb-10 max-w-sm text-sm font-medium text-slate-500">
            Your delivery has been scheduled and a rider is being assigned.
          </p>

          {/* Order summary card */}
          <div className="mb-8 border border-primary/10 bg-primary/5 p-1">
            <div className="border border-primary/5 bg-white p-6 text-left">
              {/* Status + ID */}
              <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-6">
                <div>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Order Status
                  </span>
                  <div className="inline-flex items-center gap-2 bg-accent/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    {order ? formatStatus(order.status) : "Processing"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Confirmation ID
                  </span>
                  <span className="font-mono text-sm font-bold tracking-tight text-primary">
                    {confirmationId}
                  </span>
                </div>
              </div>

              {/* ETA — only show for instant deliveries */}
              {isInstant ? (
                <div className="mb-6 grid grid-cols-2 gap-8 border-b border-slate-100 pb-6">
                  <div>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      Est. Pickup
                    </span>
                    <span className="block text-lg font-bold tracking-tight text-primary">
                      {pickupTime ? formatTime(pickupTime) : "—"}
                    </span>
                    <span className="block text-[10px] font-medium uppercase text-slate-400">
                      {pickupTime ? formatDate(pickupTime) : ""}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      Est. Delivery
                    </span>
                    <span className="block text-lg font-bold tracking-tight text-primary">
                      {deliveryTime ? formatTime(deliveryTime) : "—"}
                    </span>
                    <span className="block text-[10px] font-medium uppercase text-slate-400">
                      {deliveryTime ? formatDate(deliveryTime) : ""}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6 border-b border-slate-100 pb-6">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Delivery
                  </span>
                  <span className="block text-sm font-bold tracking-tight text-primary">
                    Scheduled delivery
                  </span>
                  <span className="block text-[10px] font-medium text-slate-400">
                    You will be notified when a courier is assigned.
                  </span>
                </div>
              )}

              {/* Route */}
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <span className="material-symbols-outlined text-sm text-accent">
                    local_shipping
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Delivery Route
                  </span>
                  <span className="text-xs font-bold tracking-tight text-slate-900">
                    {route}
                  </span>
                </div>
              </div>

              {/* Receipt / pricing */}
              {order && (
                <div>
                  <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Payment Summary
                  </span>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>Base rate</span>
                      <span>£{(order.base_price ?? 0).toFixed(2)}</span>
                    </div>
                    {(order.size_fee ?? 0) > 0 && (
                      <div className="flex justify-between font-medium text-slate-600">
                        <span>Size fee</span>
                        <span>£{order.size_fee.toFixed(2)}</span>
                      </div>
                    )}
                    {(order.scheduling_fee ?? 0) > 0 && (
                      <div className="flex justify-between font-medium text-slate-600">
                        <span>Instant handling</span>
                        <span>£{order.scheduling_fee.toFixed(2)}</span>
                      </div>
                    )}
                    {(order.discount_amount ?? 0) > 0 && (
                      <div className="flex justify-between font-medium text-emerald-600">
                        <span>Eco‑incentive discount</span>
                        <span>−£{order.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-100 pt-2 font-black text-primary">
                      <span>Total paid</span>
                      <span>£{(order.total_price ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            className="flex w-full items-center justify-center gap-3 bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-black"
            onClick={() => router.push("/order/track")}
          >
            Track Order
            <span className="material-symbols-outlined text-lg">
              arrow_right_alt
            </span>
          </button>

          <div className="mt-8 flex justify-center gap-8">
            <Link
              href="/orders"
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 transition-colors hover:text-primary"
            >
              View All Orders
            </Link>
            <Link
              href="/help"
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 transition-colors hover:text-primary"
            >
              Support Center
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 pb-8 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-10 md:grid-cols-4 md:gap-12">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center bg-primary">
                  <span className="material-symbols-outlined text-sm text-accent">
                    bolt
                  </span>
                </div>
                <span className="text-xl font-extrabold uppercase tracking-tight text-primary">
                  EcoQuick
                </span>
              </div>
              <p className="mb-6 max-w-xs text-xs font-medium leading-relaxed text-slate-500">
                Next-generation logistical infrastructure for the modern
                enterprise.
              </p>
              <div className="inline-flex items-center gap-2 border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                <span className="material-symbols-outlined text-xs">
                  eco
                </span>
                Carbon Neutral
              </div>
            </div>

            <div>
              <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                Platform
              </h4>
              <ul className="space-y-4 text-xs font-medium text-slate-500">
                <li>
                  <Link href="/orders" className="transition-colors hover:text-primary">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link href="/book/type" className="transition-colors hover:text-primary">
                    Book Delivery
                  </Link>
                </li>
                <li>
                  <Link href="/impact" className="transition-colors hover:text-primary">
                    Impact Report
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                Legal
              </h4>
              <ul className="space-y-4 text-xs font-medium text-slate-500">
                <li>
                  <Link
                    href="/help"
                    className="font-bold text-primary transition-colors hover:text-primary/80"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="transition-colors hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="transition-colors hover:text-primary">
                    Insurance Details
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                Contact
              </h4>
              <ul className="space-y-4 text-xs font-medium text-slate-500">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm text-primary">
                    terminal
                  </span>
                  ops-london-central
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm text-primary">
                    alternate_email
                  </span>
                  corporate@ecoquick.com
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 md:flex-row">
            <p>© 2026 EcoQuick Infrastructure Group</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 text-slate-500">
                <span>v.2.4.0-STABLE</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating support */}
      <button
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center bg-primary text-white shadow-xl transition-colors hover:bg-black"
        onClick={() => router.push("/help")}
        aria-label="Open support"
      >
        <span className="material-symbols-outlined">support_agent</span>
      </button>
    </div>
  );
}
