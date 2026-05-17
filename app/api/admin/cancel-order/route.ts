import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.user_metadata?.role !== "admin") {
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

    // Notify customer
    if (order.customer_id) {
      await service.from("notifications").insert({
        user_id: order.customer_id,
        order_id: orderId,
        type: "order_cancelled",
        title: "Order cancelled",
        body: reason
          ? `Your delivery EQ-${orderId.slice(0, 6).toUpperCase()} was cancelled: ${reason}`
          : `Your delivery EQ-${orderId.slice(0, 6).toUpperCase()} has been cancelled by support.`,
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

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Admin cancel error:", message);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
