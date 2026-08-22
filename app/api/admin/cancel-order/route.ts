import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type RefundResult =
  | { refunded: false; reason: string }
  | { refunded: true; refundId: string; amount: number };

async function refundIfPaid(
  service: ReturnType<typeof createServiceClient>,
  orderId: string,
  paymentStatus: string | null
): Promise<RefundResult> {
  if (paymentStatus !== "paid") return { refunded: false, reason: "not_paid" };

  if (!process.env.STRIPE_SECRET_KEY) {
    return { refunded: false, reason: "stripe_not_configured" };
  }

  const { data: payment } = await service
    .from("payments")
    .select("id, stripe_payment_intent_id, amount, status")
    .eq("order_id", orderId)
    .eq("status", "completed")
    .order("processed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment?.stripe_payment_intent_id) {
    return { refunded: false, reason: "no_payment_record" };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const refund = await stripe.refunds.create({
    payment_intent: payment.stripe_payment_intent_id,
    reason: "requested_by_customer",
    metadata: { orderId },
  });

  // Try to mark the payment row as refunded; if the table's CHECK constraint
  // doesn't include 'refunded' yet, we just leave the row as-is. The refund
  // itself succeeded with Stripe — that's the source of truth.
  await service
    .from("payments")
    .update({ status: "refunded", processed_at: new Date().toISOString() })
    .eq("id", payment.id);

  return {
    refunded: true,
    refundId: refund.id,
    amount: (refund.amount ?? 0) / 100,
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, reason } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const service = createServiceClient();
    const now = new Date().toISOString();

    const { data: order, error } = await service
      .from("delivery_orders")
      .update({ status: "cancelled", updated_at: now })
      .eq("id", orderId)
      .not("status", "in", "(delivered,cancelled)")
      .select()
      .maybeSingle();

    if (error) {
      console.error("Cancel order error:", error);
      return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json(
        { error: "Order cannot be cancelled (already delivered or cancelled)" },
        { status: 409 }
      );
    }

    // Free up the driver if assigned
    if (order.driver_id) {
      await service
        .from("driver_profiles")
        .update({ current_order_id: null })
        .eq("id", order.driver_id);
    }

    // Issue refund if the order was paid
    let refundResult: RefundResult = { refunded: false, reason: "not_paid" };
    try {
      refundResult = await refundIfPaid(service, orderId, order.payment_status);
      if (refundResult.refunded) {
        await service
          .from("delivery_orders")
          .update({ payment_status: "refunded", updated_at: new Date().toISOString() })
          .eq("id", orderId);
      }
    } catch (refundErr) {
      console.error("Refund failed:", refundErr);
      refundResult = {
        refunded: false,
        reason: refundErr instanceof Error ? refundErr.message : "refund_error",
      };
    }

    // Notify customer
    if (order.customer_id) {
      const idShort = `EQ-${orderId.slice(0, 6).toUpperCase()}`;
      const body = refundResult.refunded
        ? `Your delivery ${idShort} has been cancelled. £${refundResult.amount.toFixed(2)} will be refunded to your card within 5–10 business days.${reason ? ` Reason: ${reason}` : ""}`
        : reason
        ? `Your delivery ${idShort} was cancelled: ${reason}`
        : `Your delivery ${idShort} has been cancelled by support.`;

      await service.from("notifications").insert({
        user_id: order.customer_id,
        order_id: orderId,
        type: refundResult.refunded ? "order_refunded" : "order_cancelled",
        title: refundResult.refunded ? "Order cancelled and refunded" : "Order cancelled",
        body,
      });
    }

    // Notify driver if there was one
    if (order.driver_id) {
      await service.from("notifications").insert({
        user_id: order.driver_id,
        order_id: orderId,
        type: "order_cancelled",
        title: "Job cancelled",
        body: `Job EQ-${orderId.slice(0, 6).toUpperCase()} was cancelled.`,
      });
    }

    return NextResponse.json({
      success: true,
      refund: refundResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Admin cancel error:", message);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
