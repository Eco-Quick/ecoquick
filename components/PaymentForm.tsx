"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createClient } from "@/lib/supabase/client";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentFormProps {
  amount: number;
  orderId: string;
  onSuccess: () => void;
}

function PaymentFormContent({ amount, onSuccess }: Omit<PaymentFormProps, "orderId">) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmed`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess();
    } else {
      setError("Payment was not completed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="border border-primary/20 bg-primary/5 p-1">
        <div className="border border-primary/10 bg-white dark:bg-[#161027] p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="material-symbols-outlined text-xl text-accent">
              credit_card
            </span>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Payment Details
            </h3>
          </div>
          <PaymentElement
            options={{
              layout: { type: "tabs", defaultCollapsed: false },
            }}
          />
        </div>
      </div>

      <div className="border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-sm text-emerald-700">
            lock
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">
            Security features
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
          <span>256-bit SSL encryption</span>
          <span>PCI DSS compliant</span>
          <span>Card details never stored</span>
          <span>Fraud protection</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={processing || !stripe || !elements}
        className="flex w-full items-center justify-center gap-3 bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-black disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-base text-accent">
          lock
        </span>
        {processing ? "Processing…" : `Pay £${amount.toFixed(2)} Securely`}
      </button>

      <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
        By completing this payment you agree to our terms of service and privacy
        policy.
      </p>
    </form>
  );
}

export default function PaymentForm({ amount, orderId, onSuccess }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("You must be logged in to make a payment.");

        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ amount, currency: "gbp", orderId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to initialise payment.");
        }

        const { clientSecret: secret } = await res.json();
        if (!secret) throw new Error("No payment client secret received.");
        setClientSecret(secret);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to initialise payment.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [amount, orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-12 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
        <span className="material-symbols-outlined animate-spin text-accent">
          progress_activity
        </span>
        Initialising payment…
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {error || "Failed to initialise payment. Please refresh."}
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
            colorPrimary: "#3f0075",
            colorBackground: "#ffffff",
            colorText: "#1e293b",
            colorDanger: "#dc2626",
            fontFamily: "system-ui, -apple-system, sans-serif",
            borderRadius: "0px",
          },
        },
      }}
    >
      <PaymentFormContent amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
}
