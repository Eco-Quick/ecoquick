"use client";

import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise: Promise<Stripe | null> | null = publishableKey
  ? loadStripe(publishableKey)
  : null;

type PaymentFormProps = {
  clientSecret: string;
  orderId: string;
  amount: number;
  onCancel: () => void;
};

export function PaymentForm({ clientSecret, orderId, amount, onCancel }: PaymentFormProps) {
  if (!stripePromise) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
        Stripe is not configured. Set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in
        your environment, restart the dev server, and try again.
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#3e0074",
            colorBackground: "#ffffff",
            colorText: "#18181b",
            borderRadius: "12px",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        },
      }}
    >
      <CheckoutForm orderId={orderId} amount={amount} onCancel={onCancel} />
    </Elements>
  );
}

function CheckoutForm({
  orderId,
  amount,
  onCancel,
}: {
  orderId: string;
  amount: number;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmed?id=${orderId}`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
      // Tell the server right away so the order is marked paid without waiting
      // on the Stripe webhook (useful for local dev and as a fallback in prod).
      try {
        await fetch("/api/finalize-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id, orderId }),
        });
      } catch {
        // Even if this fails, the webhook is the source of truth. Continue.
      }
      window.location.href = `/order/confirmed?id=${orderId}`;
      return;
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
        }}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-[12px] text-zinc-500 dark:bg-[#050507] dark:text-zinc-400">
        <span className="material-symbols-outlined text-base text-emerald-600">lock</span>
        Your payment is processed securely by Stripe. We never see your card details.
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex items-center gap-2 text-[13px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600 disabled:opacity-60 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to review
        </button>
        <button
          type="submit"
          disabled={!stripe || submitting}
          className="rounded-xl bg-[#3e0074] px-8 py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-[#5b21b6]"
        >
          {submitting ? "Processing payment…" : `Pay £${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}
