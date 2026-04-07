import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// In-memory idempotency store (good enough for single-instance; swap for Redis in production)
const processedEvents = new Set<string>();

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

    // Idempotency check
    if (processedEvents.has(event.id)) {
      return NextResponse.json({ received: true, status: "already_processed" });
    }
    processedEvents.add(event.id);
    if (processedEvents.size > 1000) {
      const first = processedEvents.values().next().value;
      if (first) processedEvents.delete(first);
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

  await supabase
    .from("delivery_orders")
    .update({ status: "confirmed", payment_status: "paid", updated_at: new Date().toISOString() })
    .eq("id", orderId);

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
    processed_at: new Date().toISOString(),
  });

  // Notify customer that order is confirmed
  const customerId = paymentIntent.metadata.customerId;
  if (customerId) {
    await supabase.from("notifications").insert({
      user_id: customerId,
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

  await supabase
    .from("delivery_orders")
    .update({ status: "payment_failed", payment_status: "failed", updated_at: new Date().toISOString() })
    .eq("id", orderId);

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
    processed_at: new Date().toISOString(),
  });
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) return;

  const supabase = createServiceClient();

  await supabase
    .from("delivery_orders")
    .update({ status: "cancelled", payment_status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId);
}
