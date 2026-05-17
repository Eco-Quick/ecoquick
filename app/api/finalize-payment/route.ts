import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/**
 * Client-driven payment finalization.
 *
 * Belt-and-braces alongside the Stripe webhook: after the browser confirms a
 * payment, it calls here so the order is marked paid immediately even if the
 * webhook is delayed or not running locally. The webhook stays the source of
 * truth — this route just lets the customer's order page show "confirmed"
 * without waiting.
 *
 * Idempotent: if the order is already paid, this is a no-op.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
    }

    const { paymentIntentId, orderId } = await request.json();
    if (!paymentIntentId || !orderId) {
      return NextResponse.json(
        { error: "Missing paymentIntentId or orderId" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify this PaymentIntent is actually for this order (anti-spoofing)
    if (pi.metadata.orderId !== orderId || pi.metadata.customerId !== user.id) {
      return NextResponse.json(
        { error: "Payment intent does not belong to this order" },
        { status: 403 }
      );
    }

    const service = createServiceClient();
    const now = new Date().toISOString();

    if (pi.status === "succeeded") {
      // Idempotent update — only flips if still pending
      const { data: updated } = await service
        .from("delivery_orders")
        .update({ status: "confirmed", payment_status: "paid", updated_at: now })
        .eq("id", orderId)
        .eq("customer_id", user.id)
        .in("status", ["pending_payment", "payment_failed"])
        .select("id")
        .maybeSingle();

      // Insert payments row if not already there (webhook may have beaten us)
      if (updated) {
        const { data: existing } = await service
          .from("payments")
          .select("id")
          .eq("stripe_payment_intent_id", pi.id)
          .maybeSingle();

        if (!existing) {
          await service.from("payments").insert({
            order_id: orderId,
            customer_id: user.id,
            amount: pi.amount / 100,
            currency: pi.currency,
            payment_method: typeof pi.payment_method === "string" ? pi.payment_method : "card",
            status: "completed",
            stripe_payment_intent_id: pi.id,
            processed_at: now,
          });
        }

        await service.from("notifications").insert({
          user_id: user.id,
          order_id: orderId,
          type: "order_confirmed",
          title: "Order confirmed",
          body: `Your delivery EQ-${orderId.slice(0, 6).toUpperCase()} has been confirmed and is awaiting a driver.`,
        });
      }

      return NextResponse.json({ status: "succeeded" });
    }

    if (pi.status === "processing") {
      return NextResponse.json({ status: "processing" });
    }

    if (pi.status === "requires_payment_method" || pi.last_payment_error) {
      await service
        .from("delivery_orders")
        .update({ status: "payment_failed", payment_status: "failed", updated_at: now })
        .eq("id", orderId)
        .eq("customer_id", user.id);
      return NextResponse.json({
        status: "failed",
        message: pi.last_payment_error?.message ?? "Payment did not complete",
      });
    }

    return NextResponse.json({ status: pi.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Finalize payment error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
