"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStepper } from "../../../components/book/BookingStepper";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";

// Haversine distance in miles between two lat/lng points
function haversineDistanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculatePrice(distanceMiles: number) {
  // £2.50 for first mile, £0.50 per additional mile
  const firstMile = 2.50;
  const extraPerMile = 0.50;
  const extraMiles = Math.max(0, Math.ceil(distanceMiles) - 1);
  const total = firstMile + (extraMiles * extraPerMile);
  return { firstMile, extraMiles, extraPerMile, distanceMiles: Math.round(distanceMiles * 10) / 10, total: Math.round(total * 100) / 100 };
}

type DeliveryRequest = {
  deliveryType: "instant" | "scheduled";
  pickupAddress: string; pickupPostcode: string; pickupCity: string;
  pickupLat: number | null; pickupLng: number | null;
  senderName: string; senderPhone: string;
  dropoffAddress: string; dropoffPostcode: string; dropoffCity: string;
  dropoffLat: number | null; dropoffLng: number | null;
  recipientName: string; recipientPhone: string;
  packageCategory: string; packageSize: string;
  weight: number; totalItems: number; handlingInstructions: string;
};

export default function BookConfirmPage() {
  const user = useCustomerAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Partial<DeliveryRequest>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [showAgeRestricted, setShowAgeRestricted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const skipVerification = process.env.NEXT_PUBLIC_SKIP_VERIFICATION === "true";
  const AGE_RESTRICTED_CATEGORIES = ["alcohol", "tobacco"];

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("deliveryRequest");
      if (saved) {
        const parsed = JSON.parse(saved);
        setOrder(parsed);

        const hasRoute = parsed.deliveryType && parsed.pickupAddress && parsed.dropoffAddress;
        if (!hasRoute) { router.replace("/book/route"); return; }

        const hasParcel = parsed.packageCategory && parsed.packageSize && Number(parsed.weight) > 0;
        if (!hasParcel) { router.replace("/book/parcel"); return; }
      } else {
        router.replace("/book/type");
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Calculate distance and price
  const distanceMiles = (order.pickupLat && order.pickupLng && order.dropoffLat && order.dropoffLng)
    ? haversineDistanceMiles(order.pickupLat, order.pickupLng, order.dropoffLat, order.dropoffLng)
    : 2; // Default 2 miles if no coordinates
  const pricing = calculatePrice(distanceMiles);

  function generateVerificationCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  async function handleBookDelivery() {
    if (!user) return;

    if (!skipVerification) {
      const supabase = createClient();
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      if (freshUser?.user_metadata?.verification_status !== "verified") {
        setShowVerifyPrompt(true);
        return;
      }
      // Age-restricted check
      if (AGE_RESTRICTED_CATEGORIES.includes(order.packageCategory ?? "")) {
        if (!freshUser?.user_metadata?.is_over_18) {
          setShowAgeRestricted(true);
          return;
        }
      }
    }

    const missing: string[] = [];
    const must: (keyof DeliveryRequest)[] = [
      "deliveryType", "pickupAddress", "pickupPostcode", "pickupCity",
      "senderName", "senderPhone", "dropoffAddress", "dropoffPostcode",
      "dropoffCity", "recipientName", "recipientPhone", "packageCategory", "packageSize",
    ];
    for (const k of must) {
      const v = (order as Record<string, unknown>)[k];
      if (typeof v !== "string" || !v.trim()) missing.push(k);
    }
    if (!order.weight || Number(order.weight) <= 0) missing.push("weight");
    if (missing.length) {
      setError("Missing required details. Please complete the previous steps.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("delivery_orders")
        .insert({
          customer_id: user.id,
          scheduling_type: order.deliveryType ?? "instant",
          status: "confirmed",
          payment_status: "paid",
          verification_code: generateVerificationCode(),
          pickup_address: order.pickupAddress ?? "",
          pickup_postcode: order.pickupPostcode ?? "",
          pickup_city: order.pickupCity ?? "",
          sender_name: order.senderName ?? "",
          sender_phone: order.senderPhone ?? "",
          delivery_address: order.dropoffAddress ?? "",
          delivery_postcode: order.dropoffPostcode ?? "",
          delivery_city: order.dropoffCity ?? "",
          recipient_name: order.recipientName ?? "",
          recipient_phone: order.recipientPhone ?? "",
          product_category: order.packageCategory ?? "",
          package_size: order.packageSize ?? "medium",
          weight: order.weight ?? 0,
          total_items: order.totalItems ?? 1,
          driver_instructions: order.handlingInstructions ?? "",
          pickup_lat: order.pickupLat ?? null,
          pickup_lng: order.pickupLng ?? null,
          delivery_lat: order.dropoffLat ?? null,
          delivery_lng: order.dropoffLng ?? null,
          base_price: pricing.firstMile,
          size_fee: pricing.extraMiles * pricing.extraPerMile,
          scheduling_fee: 0,
          discount_amount: 0,
          total_price: pricing.total,
        })
        .select("id")
        .single();

      if (err) throw err;

      // Send notification to customer
      await supabase.from("notifications").insert({
        user_id: user.id,
        order_id: data.id,
        type: "order_confirmed",
        title: "Order confirmed",
        body: `Your delivery EQ-${data.id.slice(0, 6).toUpperCase()} has been placed and is awaiting a driver.`,
      });

      sessionStorage.removeItem("deliveryRequest");
      router.push(`/order/confirmed?id=${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user || !hydrated) return null;

  const isInstant = order.deliveryType !== "scheduled";
  const sizeLabelMap: Record<string, string> = { envelope: "Envelope", small: "Small", medium: "Medium", large: "Large" };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050507] dark:text-[#ede9f8]">
      <CustomerTopBar />

      <main className="flex flex-1 flex-col items-center px-4 py-6 md:py-10">
        <div className="w-full max-w-2xl">
          {/* Stepper */}
          <div className="mb-8">
            <BookingStepper currentStep={4} />
          </div>

          <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-3xl">
            Review your order
          </h1>

          {/* Order summary card */}
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">

            {/* Delivery type */}
            <div className="flex items-center gap-4 border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3e0074]/10 dark:bg-[#c084fc]/10">
                <span className="material-symbols-outlined text-lg text-[#3e0074] dark:text-[#c084fc]">
                  {isInstant ? "bolt" : "calendar_month"}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">
                  {isInstant ? "Instant Delivery" : "Scheduled Delivery"}
                </p>
                <p className="text-[12px] text-emerald-600">Carbon neutral</p>
              </div>
            </div>

            {/* Route */}
            <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-zinc-400">Pickup</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">
                    {order.pickupCity || order.pickupPostcode}
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-400 line-clamp-2">{order.pickupAddress}</p>
                  <p className="mt-1 text-[12px] text-zinc-500">{order.senderName}</p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-zinc-400">Delivery</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">
                    {order.dropoffCity || order.dropoffPostcode}
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-400 line-clamp-2">{order.dropoffAddress}</p>
                  <p className="mt-1 text-[12px] text-zinc-500">{order.recipientName}</p>
                </div>
              </div>
            </div>

            {/* Package */}
            <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <p className="mb-3 text-[11px] font-semibold text-zinc-400">Package</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {sizeLabelMap[order.packageSize ?? ""] ?? order.packageSize}
                </span>
                <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {order.weight} kg
                </span>
                <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {order.packageCategory}
                </span>
              </div>
              {order.handlingInstructions && (
                <p className="mt-3 text-[12px] italic text-zinc-400">&ldquo;{order.handlingInstructions}&rdquo;</p>
              )}
            </div>

            {/* Pricing */}
            <div className="px-6 py-5">
              <p className="mb-3 text-[11px] font-semibold text-zinc-400">Pricing</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>First mile</span>
                  <span>£{pricing.firstMile.toFixed(2)}</span>
                </div>
                {pricing.extraMiles > 0 && (
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>{pricing.extraMiles} extra mile{pricing.extraMiles > 1 ? "s" : ""} × £{pricing.extraPerMile.toFixed(2)}</span>
                    <span>£{(pricing.extraMiles * pricing.extraPerMile).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[12px] text-zinc-400">
                  <span>Distance: {pricing.distanceMiles} miles</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-bold text-zinc-900 dark:border-zinc-800 dark:text-[#ede9f8]">
                  <span>Total</span>
                  <span>£{pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Errors / Verification prompt */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {showVerifyPrompt && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800/30 dark:bg-amber-900/10">
              <span className="material-symbols-outlined mb-2 text-3xl text-amber-600">verified_user</span>
              <h3 className="mb-1 text-sm font-bold text-amber-800 dark:text-amber-300">Identity verification required</h3>
              <p className="mb-4 text-[12px] text-amber-700/70 dark:text-amber-400/70">
                UK law requires age verification before booking deliveries.
              </p>
              <button
                onClick={() => router.push("/verify")}
                className="rounded-lg bg-amber-600 px-6 py-2.5 text-[12px] font-bold text-white transition-all hover:bg-amber-700 active:scale-[0.98]"
              >
                Verify Now
              </button>
            </div>
          )}

          {showAgeRestricted && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800/30 dark:bg-red-900/10">
              <span className="material-symbols-outlined mb-2 text-3xl text-red-500">block</span>
              <h3 className="mb-1 text-sm font-bold text-red-800 dark:text-red-300">Age restricted item</h3>
              <p className="mb-4 text-[12px] text-red-700/70 dark:text-red-400/70">
                You must be 18 or over to book delivery of {order.packageCategory}. This is a UK legal requirement.
              </p>
              <button
                onClick={() => router.push("/book/parcel")}
                className="rounded-lg border border-red-300 px-6 py-2.5 text-[12px] font-bold text-red-700 transition-all hover:bg-red-100 active:scale-[0.98] dark:border-red-700 dark:text-red-400"
              >
                Change category
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <Link
              href="/book/parcel"
              className="flex items-center gap-2 text-[13px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </Link>
            <button
              onClick={handleBookDelivery}
              disabled={loading}
              className="rounded-xl bg-[#3e0074] px-10 py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] disabled:opacity-60 dark:bg-[#5b21b6]"
            >
              {loading ? "Placing order…" : `Confirm & Book · £${pricing.total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
