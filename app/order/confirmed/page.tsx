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
  verification_code: string | null;
  customer_rating: number | null;
  driver_id: string | null;
  driver_profiles: {
    full_name: string;
    phone: string;
    vehicle_type: string;
    rating: number;
  } | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  confirmed: { label: "Looking for driver", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20", icon: "search" },
  assigned: { label: "Driver assigned", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", icon: "person" },
  picked_up: { label: "Picked up", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20", icon: "local_mall" },
  in_transit: { label: "On the way", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20", icon: "local_shipping" },
  delivered: { label: "Delivered", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", icon: "check_circle" },
};

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>}>
      <OrderConfirmedContent />
    </Suspense>
  );
}

function OrderConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useCustomerAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  const orderId = searchParams.get("id");

  useEffect(() => {
    if (!orderId) { setFetchError(true); return; }
    fetchOrder();
  }, [orderId]);

  // Real-time subscription for status updates
  useEffect(() => {
    if (!orderId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "delivery_orders",
        filter: `id=eq.${orderId}`,
      }, () => {
        fetchOrder();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  async function fetchOrder() {
    const supabase = createClient();

    // Fetch order without join first
    const { data, error } = await supabase
      .from("delivery_orders")
      .select("id, status, scheduling_type, created_at, customer_id, pickup_address, pickup_postcode, pickup_city, delivery_address, delivery_postcode, delivery_city, total_price, base_price, size_fee, scheduling_fee, discount_amount, verification_code, customer_rating, driver_id")
      .eq("id", orderId!)
      .single();

    if (error || !data) { setFetchError(true); return; }
    if (user && data.customer_id !== user.id) { setFetchError(true); return; }

    // Fetch driver profile separately if driver is assigned
    let driverProfile = null;
    if (data.driver_id) {
      const { data: dp } = await supabase
        .from("driver_profiles")
        .select("full_name, phone, vehicle_type, rating")
        .eq("id", data.driver_id)
        .single();
      driverProfile = dp;
    }

    setOrder({ ...data, driver_profiles: driverProfile } as unknown as Order);
    if (data.customer_rating) {
      setRating(data.customer_rating);
      setRatingSubmitted(true);
    }
  }

  async function submitRating() {
    if (!order || rating === 0) return;
    setSubmittingRating(true);
    const supabase = createClient();

    // Update order with rating
    await supabase
      .from("delivery_orders")
      .update({ customer_rating: rating })
      .eq("id", order.id);

    // Update driver's average rating
    if (order.driver_id) {
      const { data: allRatings } = await supabase
        .from("delivery_orders")
        .select("customer_rating")
        .eq("driver_id", order.driver_id)
        .not("customer_rating", "is", null);

      if (allRatings && allRatings.length > 0) {
        const ratings = [...allRatings.map(r => Number(r.customer_rating)), rating];
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        await supabase
          .from("driver_profiles")
          .update({ rating: Math.round(avg * 100) / 100 })
          .eq("id", order.driver_id);
      }
    }

    setRatingSubmitted(true);
    setSubmittingRating(false);
  }

  if (!user) return null;

  if (fetchError) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050507]">
        <CustomerTopBar />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
          <span className="material-symbols-outlined text-5xl text-zinc-300">error_outline</span>
          <p className="font-bold text-zinc-500">Order not found</p>
          <Link href="/orders" className="text-sm font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">View all orders</Link>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050507]">
        <CustomerTopBar />
        <main className="flex flex-1 items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-3xl text-[#3e0074] dark:text-[#c084fc]">progress_activity</span>
        </main>
      </div>
    );
  }

  const confirmationId = `EQ-${order.id.slice(0, 6).toUpperCase()}`;
  const statusConf = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.confirmed;
  const driver = order.driver_profiles;
  const isDelivered = order.status === "delivered";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050507] dark:text-[#ede9f8]">
      <CustomerTopBar />

      <main className="flex flex-1 justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg">

          {/* Status header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#3e0074]/10 dark:bg-[#c084fc]/10">
              <span className="material-symbols-outlined text-3xl text-[#3e0074] dark:text-[#c084fc]">{statusConf.icon}</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#ede9f8]">
              {isDelivered ? "Delivery Complete" : "Order Placed"}
            </h1>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-semibold ${statusConf.color}`}>
              {order.status === "confirmed" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
              {statusConf.label}
            </div>
          </div>

          {/* Main card */}
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">

            {/* Order ID + Verification Code */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <div>
                <p className="text-[11px] font-semibold text-zinc-400">Order ID</p>
                <p className="font-mono text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">{confirmationId}</p>
              </div>
              {order.verification_code && (
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-zinc-400">Verification PIN</p>
                  <p className="font-mono text-2xl font-bold tracking-widest text-[#3e0074] dark:text-[#c084fc]">
                    {order.verification_code}
                  </p>
                </div>
              )}
            </div>

            {/* Driver info — shows when assigned */}
            {driver && (
              <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
                <p className="mb-3 text-[11px] font-semibold uppercase text-zinc-400">Your Driver</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3e0074] text-white dark:bg-[#5b21b6]">
                      <span className="material-symbols-outlined text-xl">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">{driver.full_name}</p>
                      <div className="flex items-center gap-2 text-[12px] text-zinc-400">
                        <span>{driver.vehicle_type}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs text-amber-400">star</span>
                          {Number(driver.rating).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {driver.phone && (
                    <a
                      href={`tel:${driver.phone}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
                    >
                      <span className="material-symbols-outlined text-lg">call</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Waiting for driver */}
            {!driver && !isDelivered && (
              <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-lg text-amber-500">progress_activity</span>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Looking for a driver nearby...</p>
                </div>
              </div>
            )}

            {/* Route */}
            <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400">Pickup</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">{order.pickup_city || order.pickup_postcode}</p>
                  <p className="text-[12px] text-zinc-400">{order.pickup_address}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400">Delivery</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">{order.delivery_city || order.delivery_postcode}</p>
                  <p className="text-[12px] text-zinc-400">{order.delivery_address}</p>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="px-6 py-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Base rate</span><span>£{order.base_price.toFixed(2)}</span>
                </div>
                {order.size_fee > 0 && (
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Size fee</span><span>£{order.size_fee.toFixed(2)}</span>
                  </div>
                )}
                {order.scheduling_fee > 0 && (
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Instant fee</span><span>£{order.scheduling_fee.toFixed(2)}</span>
                  </div>
                )}
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Eco discount</span><span>-£{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-100 pt-2 font-bold text-zinc-900 dark:border-zinc-800 dark:text-[#ede9f8]">
                  <span>Total</span><span>£{order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating — only after delivery */}
          {isDelivered && driver && (
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-6 py-6 text-center dark:border-zinc-800 dark:bg-[#0c0b14]">
              {ratingSubmitted ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-emerald-500">thumb_up</span>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">
                    Thanks for rating {driver.full_name}!
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={`material-symbols-outlined text-lg ${i <= rating ? "text-amber-400" : "text-zinc-200 dark:text-zinc-700"}`}>star</span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-1 text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">Rate your driver</p>
                  <p className="mb-4 text-[12px] text-zinc-400">How was your experience with {driver.full_name}?</p>
                  <div className="mb-4 flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i)}
                        className="transition-transform hover:scale-110 active:scale-95"
                      >
                        <span className={`material-symbols-outlined text-3xl ${
                          i <= (hoverRating || rating) ? "text-amber-400" : "text-zinc-200 dark:text-zinc-700"
                        }`}>star</span>
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <button
                      onClick={submitRating}
                      disabled={submittingRating}
                      className="rounded-xl bg-[#3e0074] px-8 py-3 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 dark:bg-[#5b21b6]"
                    >
                      {submittingRating ? "Submitting…" : "Submit Rating"}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            {!isDelivered && (
              <button
                onClick={() => router.push(`/order/track?id=${order.id}`)}
                className="flex-1 rounded-xl bg-[#3e0074] py-4 text-center text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all hover:-translate-y-0.5 active:scale-[0.98] dark:bg-[#5b21b6]"
              >
                Track Order
              </button>
            )}
            <Link
              href="/orders"
              className="flex-1 rounded-xl border border-zinc-200 bg-white py-4 text-center text-[13px] font-bold text-zinc-700 transition-all hover:-translate-y-0.5 active:scale-[0.98] dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-zinc-300"
            >
              All Orders
            </Link>
          </div>

          {order.verification_code && !isDelivered && (
            <p className="mt-4 text-center text-[12px] text-zinc-400">
              Share your PIN <strong className="text-[#3e0074] dark:text-[#c084fc]">{order.verification_code}</strong> with the driver to confirm delivery.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
