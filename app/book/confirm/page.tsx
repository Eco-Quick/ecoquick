"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStepper } from "../../../components/book/BookingStepper";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";
import PaymentForm from "@/components/PaymentForm";

const BoltIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" aria-hidden>
    <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
    <path d="M12 3L5 6v6c0 4.243 2.686 7.657 7 9 4.314-1.343 7-4.757 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12.5 11 14.5 15 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowEastIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function calculatePrice(packageSize: string, deliveryType: string) {
  const base = 8.0;
  const sizeFees: Record<string, number> = { envelope: 0, small: 3.5, medium: 6.5, large: 12.0 };
  const sizeFee = sizeFees[packageSize] ?? 6.5;
  const schedulingFee = deliveryType === "instant" ? 4.0 : 0;
  const discount = 1.5;
  return { base, sizeFee, schedulingFee, discount, total: base + sizeFee + schedulingFee - discount };
}

type DeliveryRequest = {
  deliveryType: "instant" | "scheduled";
  pickupAddress: string; pickupPostcode: string; pickupCity: string;
  senderName: string; senderPhone: string;
  dropoffAddress: string; dropoffPostcode: string; dropoffCity: string;
  recipientName: string; recipientPhone: string;
  packageCategory: string; packageSize: string;
  weight: number; totalItems: number; handlingInstructions: string;
};

export default function BookConfirmPage() {
  const user = useCustomerAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Partial<DeliveryRequest>>({});
  const [step, setStep] = useState<"review" | "payment">("review");
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("deliveryRequest");
      if (saved) {
        const parsed = JSON.parse(saved);
        setOrder(parsed);

        // Step gating: confirm requires route + parcel info
        const hasRoute =
          parsed.deliveryType &&
          parsed.pickupAddress &&
          parsed.pickupPostcode &&
          parsed.pickupCity &&
          parsed.senderName &&
          parsed.senderPhone &&
          parsed.dropoffAddress &&
          parsed.dropoffPostcode &&
          parsed.dropoffCity &&
          parsed.recipientName &&
          parsed.recipientPhone;
        if (!hasRoute) {
          router.replace("/book/route");
          return;
        }

        const hasParcel =
          parsed.packageCategory &&
          parsed.packageSize &&
          parsed.weight != null &&
          Number(parsed.weight) > 0;
        if (!hasParcel) {
          router.replace("/book/parcel");
          return;
        }
      } else {
        router.replace("/book/type");
      }
    } catch {}
  }, []);

  const pricing = calculatePrice(order.packageSize ?? "", order.deliveryType ?? "instant");
  const isInstant = order.deliveryType !== "scheduled";

  const sizeLabelMap: Record<string, string> = {
    envelope: "Envelope", small: "Small", medium: "Medium", large: "Large",
  };

  // Step 1: Create order as pending, then show payment form
  async function handleProceedToPayment() {
    if (!user) return;
    // Hard validation before creating pending order in DB
    const missing: string[] = [];
    const must: (keyof DeliveryRequest)[] = [
      "deliveryType",
      "pickupAddress",
      "pickupPostcode",
      "pickupCity",
      "senderName",
      "senderPhone",
      "dropoffAddress",
      "dropoffPostcode",
      "dropoffCity",
      "recipientName",
      "recipientPhone",
      "packageCategory",
      "packageSize",
    ];
    for (const k of must) {
      const v = (order as any)[k];
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
          status: "pending",
          payment_status: "pending",
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
          base_price: pricing.base,
          size_fee: pricing.sizeFee,
          scheduling_fee: pricing.schedulingFee,
          discount_amount: pricing.discount,
          total_price: pricing.total,
        })
        .select("id")
        .single();

      if (err) throw err;
      setPendingOrderId(data.id);
      setStep("payment");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Payment succeeded — clear sessionStorage and go to confirmation
  function handlePaymentSuccess() {
    sessionStorage.removeItem("deliveryRequest");
    router.push(`/order/confirmed?id=${pendingOrderId}`);
  }

  if (!user) return null;

  return (
    <div className="page-fade flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <CustomerTopBar />

      <main className="flex flex-1 flex-col items-center py-8 px-4 md:px-6">
        <div className="w-full max-w-5xl bg-white shadow-[0_20px_50px_-12px_rgba(62,0,116,0.15)]">
          {/* Stepper */}
          <div className="border-b border-slate-100 bg-white px-6 pb-12 pt-10 md:px-8">
            <BookingStepper currentStep={4} />
            <div className="mt-10 text-center">
              <h1 className="text-3xl font-black uppercase tracking-tight text-primary sm:text-4xl">
                {step === "review" ? "Review your order" : "Complete payment"}
              </h1>
              <div className="mx-auto mt-4 h-1 w-12 bg-primary" aria-hidden />
            </div>
          </div>

          <div className="bg-white px-6 py-10 md:px-10 md:py-12">

            {/* ── REVIEW STEP ── */}
            {step === "review" && (
              <>
                {/* Order summary card */}
                <div className="overflow-hidden bg-white ring-1 ring-slate-200">
                  <div className="grid border-b border-slate-200 md:grid-cols-2">
                    <div className="border-b border-slate-100 p-8 md:border-r">
                      <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        01. Service mode
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded border border-primary/10 bg-primary text-white">
                          {isInstant ? <BoltIcon /> : <CalendarIcon />}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight text-primary">
                            {isInstant ? "Instant eco‑delivery" : "Scheduled delivery"}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                            Carbon neutral verified
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-slate-100 p-8">
                      <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        02. Cargo specs
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Size</p>
                          <p className="text-xs font-black uppercase text-slate-900">
                            {sizeLabelMap[order.packageSize ?? ""] ?? order.packageSize ?? "—"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Weight</p>
                          <p className="text-xs font-black uppercase text-slate-900">
                            {order.weight ? `${order.weight} kg` : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-slate-100 p-8 md:border-r">
                      <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        03. Origin
                      </h3>
                      <p className="text-xs font-black uppercase tracking-tight text-slate-900">
                        {[order.pickupPostcode, order.pickupCity].filter(Boolean).join(", ") || "—"}
                      </p>
                      <p className="mt-1 text-[10px] font-bold tracking-wide text-slate-500">
                        {order.pickupAddress || "Address not provided"}
                      </p>
                    </div>

                    <div className="border-b border-slate-100 p-8">
                      <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        04. Destination
                      </h3>
                      <p className="text-xs font-black uppercase tracking-tight text-slate-900">
                        {[order.dropoffPostcode, order.dropoffCity].filter(Boolean).join(", ") || "—"}
                      </p>
                      <p className="mt-1 text-[10px] font-bold tracking-wide text-slate-500">
                        {order.dropoffAddress || "Address not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-slate-900 p-8 text-white">
                    <div className="flex flex-col items-end justify-between gap-8 md:flex-row">
                      <div className="hidden w-full max-w-xs md:block">
                        <div className="border border-white/10 bg-white/5 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm text-[#ff9b16]">★</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff9b16]">
                              Eco incentive
                            </span>
                          </div>
                          <p className="text-[10px] font-medium leading-relaxed text-slate-300">
                            You are saving £{pricing.discount.toFixed(2)} on this shipment with your eco‑credits.
                          </p>
                        </div>
                      </div>

                      <div className="w-full space-y-3 md:w-auto md:min-w-[320px]">
                        <div className="flex items-baseline justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                          <span>Base rate</span>
                          <span className="text-white">£{pricing.base.toFixed(2)}</span>
                        </div>
                        {pricing.sizeFee > 0 && (
                          <div className="flex items-baseline justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                            <span>Size fee ({sizeLabelMap[order.packageSize ?? ""] ?? order.packageSize})</span>
                            <span className="text-white">£{pricing.sizeFee.toFixed(2)}</span>
                          </div>
                        )}
                        {pricing.schedulingFee > 0 && (
                          <div className="flex items-baseline justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                            <span>Instant handling</span>
                            <span className="text-white">£{pricing.schedulingFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex items-baseline justify-between py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                          <span>Eco‑incentive</span>
                          <span>-£{pricing.discount.toFixed(2)}</span>
                        </div>
                        <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
                          <div className="flex flex-col gap-1">
                            <span className="w-fit bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                              Total quote
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              VAT included
                            </span>
                          </div>
                          <span className="text-4xl font-black tracking-tighter md:text-5xl">
                            £{pricing.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div className="mx-auto mt-12 flex max-w-4xl items-center justify-between border-t border-slate-100 pt-6">
                  <Link
                    href="/book/parcel"
                    className="group flex items-center gap-2 pl-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">
                      arrow_back
                    </span>
                    Back
                  </Link>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={loading}
                    className="btn-press btn-sweep flex items-center gap-3 bg-primary px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-black disabled:opacity-60"
                  >
                    {loading ? "Please wait…" : "Proceed to payment"}
                    {!loading && (
                      <span className="text-accent">
                        <ArrowEastIcon />
                      </span>
                    )}
                  </button>
                </div>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 border border-slate-200 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <span className="text-primary"><ShieldCheckIcon /></span>
                    Secure architectural protocol
                  </div>
                  <p className="max-w-md text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Final valuation is subject to real‑time verification at pickup point. EcoQuick maintains carbon neutrality across all operations.
                  </p>
                </div>
              </>
            )}

            {/* ── PAYMENT STEP ── */}
            {step === "payment" && pendingOrderId && (
              <div className="mx-auto max-w-xl">
                {/* Order amount reminder */}
                <div className="mb-8 flex items-center justify-between border border-slate-200 bg-slate-50 px-6 py-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Order total
                    </p>
                    <p className="text-2xl font-black tracking-tight text-primary">
                      £{pricing.total.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => { setStep("review"); setPendingOrderId(null); }}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-primary"
                  >
                    ← Edit order
                  </button>
                </div>

                <PaymentForm
                  amount={pricing.total}
                  orderId={pendingOrderId}
                  onSuccess={handlePaymentSuccess}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
