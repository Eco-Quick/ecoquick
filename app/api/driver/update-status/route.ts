import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const VALID_TRANSITIONS: Record<string, string> = {
  assigned: "picked_up",
  picked_up: "in_transit",
  in_transit: "delivered",
};

const TIMESTAMP_COLUMNS: Record<string, string> = {
  picked_up: "picked_up_at",
  in_transit: "in_transit_at",
  delivered: "delivered_at",
};

const NOTIFICATION_MESSAGES: Record<string, { title: string; body: string }> = {
  picked_up: { title: "Order picked up", body: "Your order has been picked up by the driver." },
  in_transit: { title: "Order on its way", body: "Your order is on its way to the delivery address." },
  delivered: { title: "Order delivered", body: "Your order has been delivered successfully." },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, newStatus } = await request.json();
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: "Missing orderId or newStatus" }, { status: 400 });
    }

    const service = createServiceClient();

    // Fetch current order to validate transition
    const { data: order } = await service
      .from("delivery_orders")
      .select("*")
      .eq("id", orderId)
      .eq("driver_id", user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const expectedNext = VALID_TRANSITIONS[order.status];
    if (expectedNext !== newStatus) {
      return NextResponse.json(
        { error: `Invalid transition from ${order.status} to ${newStatus}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: now,
      [TIMESTAMP_COLUMNS[newStatus]]: now,
    };

    const { data: updated, error: updateErr } = await service
      .from("delivery_orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // On delivered: update driver stats
    if (newStatus === "delivered") {
      const driverEarning = Number(order.total_price) * 0.8;
      const { data: profile } = await service
        .from("driver_profiles")
        .select("total_deliveries, total_earnings")
        .eq("id", user.id)
        .single();

      await service
        .from("driver_profiles")
        .update({
          current_order_id: null,
          total_deliveries: (profile?.total_deliveries ?? 0) + 1,
          total_earnings: Number(profile?.total_earnings ?? 0) + driverEarning,
          updated_at: now,
        })
        .eq("id", user.id);
    }

    // Notify customer
    const msg = NOTIFICATION_MESSAGES[newStatus];
    if (msg) {
      await service.from("notifications").insert({
        user_id: order.customer_id,
        order_id: orderId,
        type: newStatus === "picked_up" ? "picked_up" : newStatus === "in_transit" ? "in_transit" : "delivered",
        title: msg.title,
        body: msg.body,
      });
    }

    return NextResponse.json({ order: updated });
  } catch (error: unknown) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
