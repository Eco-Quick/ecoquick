"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStepper } from "../../../components/book/BookingStepper";
import { BookingTopBar } from "@/components/layout/BookingTopBar";
import { PaymentForm } from "@/components/book/PaymentForm";
import { useBookingAuth } from "@/hooks/useBookingAuth";
import { BookingAuthError } from "@/components/book/BookingAuthError";
import { createClient } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

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

const DISTANCE_BANDS = [
  { upTo: 1, price: 4.99, label: "0–1 mile" },
  { upTo: 3, price: 5.99, label: "1–3 miles" },
  { upTo: 6, price: 8.49, label: "3–6 miles" },
  { upTo: 8, price: 10.99, label: "6–8 miles" },
] as const;

function calculatePrice(distanceMiles: number) {
  const rounded = Math.round(distanceMiles * 10) / 10;
  const band =
    DISTANCE_BANDS.find((b) => distanceMiles <= b.upTo) ??
    DISTANCE_BANDS[DISTANCE_BANDS.length - 1];
  return {
    distanceMiles: rounded,
    bandLabel: band.label,
    total: band.price,
  };
}

type DeliveryRequest = {
  deliveryType: "instant" | "scheduled";
  pickupAddress: string; pickupPostcode: string; pickupCity: string;
  pickupLat: number | null; pickupLng: number | null;
  senderName: string; senderPhone: string;
  dropoffAddress: string; dropoffPostcode: string; dropoffCity: string;
  dropoffLat: number | null; dropoffLng: number | null;
  recipientName: string; recipientPhone: string;
  packageCategory: string; categoryDetails: string; packageSize: string;
  weight: number; totalItems: number; handlingInstructions: string;
};

export default function BookConfirmPage() {
  const { user, error: authError } = useBookingAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Partial<DeliveryRequest>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<"review" | "account" | "payment">("review");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // Set once a guest finishes creating their account — flips the page out of the
  // "guest" state (reveals the price) without waiting for the auth hook to re-run.
  const [accountReady, setAccountReady] = useState(false);

  // Guest → permanent account form (shown at checkout for anonymous users)
  const [acctName, setAcctName] = useState("");
  const [acctEmail, setAcctEmail] = useState("");
  const [acctPhone, setAcctPhone] = useState("");
  const [acctPassword, setAcctPassword] = useState("");
  const [acctError, setAcctError] = useState<string | null>(null);
  const [acctLoading, setAcctLoading] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);

  // A visitor is a "guest" until they've created a permanent account. Guests can
  // build the order but don't see the price until they sign up.
  const isGuest = !!user?.isAnonymous && !accountReady;

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

  // Review CTA: anonymous guests must create an account first; everyone else books directly.
  function handleReviewContinue() {
    if (isGuest) {
      // Pre-fill from the sender details they already entered.
      setAcctName((prev) => prev || order.senderName?.trim() || "");
      setAcctPhone((prev) => prev || order.senderPhone?.trim() || "");
      setEmailTaken(false);
      setAcctError(null);
      setStep("account");
    } else {
      handleBookDelivery();
    }
  }

  async function handleCreateAccount(event: { preventDefault(): void }) {
    event.preventDefault();
    setAcctError(null);
    setEmailTaken(false);

    const name = acctName.trim();
    if (name.length < 2 || !/\s/.test(name)) {
      setAcctError("Please enter your first and last name.");
      return;
    }
    const email = acctEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setAcctError("Enter a valid email address.");
      return;
    }
    if (acctPhone.trim() && !PHONE_RE.test(acctPhone.trim())) {
      setAcctError("Enter a valid phone number.");
      return;
    }
    if (acctPassword.length < 8 || !/[A-Za-z]/.test(acctPassword) || !/\d/.test(acctPassword)) {
      setAcctError("Password must be at least 8 characters and include letters and numbers.");
      return;
    }

    setAcctLoading(true);
    try {
      const res = await fetch("/api/auth/convert-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: acctPassword,
          full_name: name,
          phone_number: acctPhone.trim(),
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error === "EMAIL_TAKEN") {
          setEmailTaken(true);
          return;
        }
        throw new Error(json.error ?? "Could not create your account. Please try again.");
      }

      // Refresh the session so is_anonymous flips false and the new metadata is in
      // the token before we continue to payment.
      const supabase = createClient();
      await supabase.auth.refreshSession();

      // Back to the review — now that they have an account the price is revealed
      // and they can continue to payment.
      setAccountReady(true);
      setStep("review");
    } catch (e: unknown) {
      setAcctError(e instanceof Error ? e.message : "Could not create your account. Please try again.");
    } finally {
      setAcctLoading(false);
    }
  }

  async function handleBookDelivery() {
    if (!user) return;

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
          status: "pending_payment",
          payment_status: "pending",
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
          driver_instructions: [
            order.packageCategory === "other" && order.categoryDetails ? `Item: ${order.categoryDetails}` : null,
            order.handlingInstructions || null,
          ].filter(Boolean).join(" — "),
          pickup_lat: order.pickupLat ?? null,
          pickup_lng: order.pickupLng ?? null,
          delivery_lat: order.dropoffLat ?? null,
          delivery_lng: order.dropoffLng ?? null,
          base_price: pricing.total,
          size_fee: 0,
          scheduling_fee: 0,
          discount_amount: 0,
          total_price: pricing.total,
        })
        .select("id")
        .single();

      if (err) throw err;

      const piRes = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pricing.total,
          currency: "gbp",
          orderId: data.id,
        }),
      });
      const piJson = await piRes.json();

      if (!piRes.ok || !piJson.clientSecret) {
        throw new Error(piJson.error ?? "Could not start payment. Please try again.");
      }

      sessionStorage.removeItem("deliveryRequest");
      setOrderId(data.id);
      setClientSecret(piJson.clientSecret);
      setStep("payment");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function cancelPayment() {
    // User wants to go back and edit. Keep the unpaid order row — they can retry from /orders or abandon.
    setStep("review");
    setClientSecret(null);
  }

  if (authError) return <BookingAuthError message={authError} />;
  if (!user || !hydrated) return null;

  const isInstant = order.deliveryType !== "scheduled";
  const sizeLabelMap: Record<string, string> = { envelope: "Envelope", small: "Small", medium: "Medium", large: "Large" };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050507] dark:text-[#ede9f8]">
      <BookingTopBar isAnonymous={isGuest} />

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
                <p className="text-[12px] text-zinc-400">
                  {isInstant ? "Delivered within 60 minutes" : "Delivered at your chosen time"}
                </p>
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
                  {order.packageCategory === "other" && order.categoryDetails ? order.categoryDetails : order.packageCategory}
                </span>
              </div>
              {order.handlingInstructions && (
                <p className="mt-3 text-[12px] italic text-zinc-400">&ldquo;{order.handlingInstructions}&rdquo;</p>
              )}
            </div>

            {/* Pricing — locked for guests until they create an account */}
            <div className="px-6 py-5">
              <p className="mb-3 text-[11px] font-semibold text-zinc-400">Pricing</p>
              {isGuest ? (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-[#050507]">
                  <span className="material-symbols-outlined text-xl text-[#3e0074] dark:text-[#c084fc]">lock</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">
                      Sign up to book your first order
                    </p>
                    <p className="text-[12px] text-zinc-400">
                      It takes a few seconds — then your delivery quote is revealed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Delivery fee ({pricing.bandLabel})</span>
                    <span>£{pricing.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[12px] text-zinc-400">
                    <span>Distance: {pricing.distanceMiles} miles</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-bold text-zinc-900 dark:border-zinc-800 dark:text-[#ede9f8]">
                    <span>Total</span>
                    <span>£{pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Errors / Verification prompt */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {/* Actions / Account / Payment */}
          {step === "review" && (
            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/book/parcel"
                className="flex items-center gap-2 text-[13px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back
              </Link>
              <button
                onClick={handleReviewContinue}
                disabled={loading}
                className="rounded-xl bg-[#3e0074] px-10 py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] disabled:opacity-60 dark:bg-[#5b21b6]"
              >
                {loading
                  ? "Preparing payment…"
                  : isGuest
                  ? "Sign up to book your first order"
                  : `Continue to payment · £${pricing.total.toFixed(2)}`}
              </button>
            </div>
          )}

          {step === "account" && (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0b14] sm:p-8">
              <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">
                Create your account
              </h2>
              <p className="mb-6 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                One quick step so you can track this delivery and book again — no email confirmation needed.
              </p>

              <form className="space-y-4" onSubmit={handleCreateAccount} noValidate>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Full name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={acctName}
                    onChange={(e) => setAcctName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Email address</label>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="john@email.com"
                      value={acctEmail}
                      onChange={(e) => { setAcctEmail(e.target.value); setEmailTaken(false); }}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Phone number</label>
                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+44 7000 000000"
                      value={acctPhone}
                      onChange={(e) => setAcctPhone(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 8 chars, letters + numbers"
                    value={acctPassword}
                    onChange={(e) => setAcctPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8]"
                  />
                </div>

                {acctError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
                    <span className="material-symbols-outlined text-base">error</span>
                    {acctError}
                  </div>
                )}

                {emailTaken && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300">
                    <span>An account with this email already exists.</span>
                    <Link href="/login" className="shrink-0 font-bold underline underline-offset-2">Log in</Link>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setStep("review")}
                    className="flex items-center gap-2 text-[13px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={acctLoading || loading}
                    className="rounded-xl bg-[#3e0074] px-10 py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] disabled:opacity-60 dark:bg-[#5b21b6]"
                  >
                    {acctLoading || loading ? "Creating account…" : "Continue"}
                  </button>
                </div>
              </form>

              <p className="mt-5 text-center text-[12px] text-zinc-400 dark:text-zinc-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {step === "payment" && clientSecret && orderId && (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0b14]">
              <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">
                Payment
              </h2>
              <p className="mb-5 text-[12px] text-zinc-500 dark:text-zinc-400">
                Pay £{pricing.total.toFixed(2)} to confirm your delivery.
              </p>
              <PaymentForm
                clientSecret={clientSecret}
                orderId={orderId}
                amount={pricing.total}
                onCancel={cancelPayment}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
