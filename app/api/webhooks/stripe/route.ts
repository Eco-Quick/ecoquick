import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = Stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
    }

    return NextResponse.json({ received: true, event: event.type });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) return;

  const supabase = createServiceClient();

  // Idempotency: if a completed payments row already exists for this PI, the
  // handler has already run. Stripe retries on any non-2xx so this is critical.
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .maybeSingle();

  if (existingPayment?.status === "completed") return;

  const now = new Date().toISOString();

  // Flip the order — gated on still being unpaid so we don't reverse a later state.
  const { data: updatedOrder } = await supabase
    .from("delivery_orders")
    .update({ status: "confirmed", payment_status: "paid", updated_at: now })
    .eq("id", orderId)
    .in("status", ["pending_payment", "payment_failed"])
    .select("id, customer_id")
    .maybeSingle();

  // Insert payments row only if missing (the finalize-payment route may have inserted it first).
  if (!existingPayment) {
    await supabase.from("payments").insert({
      order_id: orderId,
      customer_id: paymentIntent.metadata.customerId ?? null,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      payment_method: typeof paymentIntent.payment_method === "string"
        ? paymentIntent.payment_method
        : "card",
      status: "completed",
      stripe_payment_intent_id: paymentIntent.id,
      processed_at: now,
    });
  } else {
    // Existing row but not completed (e.g. previously failed); flip to completed.
    await supabase
      .from("payments")
      .update({ status: "completed", processed_at: now })
      .eq("id", existingPayment.id);
  }

  // Only send the notification if we actually advanced the order in this run —
  // prevents duplicate inbox spam when finalize-payment beats the webhook.
  if (updatedOrder) {
    await supabase.from("notifications").insert({
      user_id: updatedOrder.customer_id,
      order_id: orderId,
      type: "order_confirmed",
      title: "Order confirmed",
      body: `Your delivery EQ-${orderId.slice(0, 6).toUpperCase()} has been confirmed and is awaiting a driver.`,
    });
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) return;

  const supabase = createServiceClient();

  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .maybeSingle();

  // Already terminally recorded — nothing to do.
  if (existingPayment?.status === "failed" || existingPayment?.status === "completed") return;

  const now = new Date().toISOString();

  await supabase
    .from("delivery_orders")
    .update({ status: "payment_failed", payment_status: "failed", updated_at: now })
    .eq("id", orderId)
    .eq("status", "pending_payment");

  if (!existingPayment) {
    await supabase.from("payments").insert({
      order_id: orderId,
      customer_id: paymentIntent.metadata.customerId ?? null,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      payment_method: typeof paymentIntent.payment_method === "string"
        ? paymentIntent.payment_method
        : "card",
      status: "failed",
      stripe_payment_intent_id: paymentIntent.id,
      processed_at: now,
    });
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) return;

  const supabase = createServiceClient();

  await supabase
    .from("delivery_orders")
    .update({ status: "cancelled", payment_status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .in("status", ["pending_payment"]);
}
