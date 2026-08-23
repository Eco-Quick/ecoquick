import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const NOT_ASSIGNABLE_STATUSES = ["picked_up", "in_transit", "delivered", "cancelled"];

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

    const { orderId, driverId } = await request.json();
    if (!orderId || !driverId) {
      return NextResponse.json({ error: "Missing orderId or driverId" }, { status: 400 });
    }

    const service = createServiceClient();

    const { data: previous } = await service
      .from("delivery_orders")
      .select("driver_id, status")
      .eq("id", orderId)
      .maybeSingle();

    if (!previous) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (NOT_ASSIGNABLE_STATUSES.includes(previous.status)) {
      return NextResponse.json(
        { error: `Order is already ${previous.status.replace(/_/g, " ")} — can't reassign.` },
        { status: 409 }
      );
    }

    const { data: order, error } = await service
      .from("delivery_orders")
      .update({
        driver_id: driverId,
        status: "assigned",
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error || !order) {
      console.error("Admin assign-driver error:", error);
      return NextResponse.json({ error: "Failed to assign driver" }, { status: 500 });
    }

    // Free up the previous driver, if any and different from the new one.
    if (previous.driver_id && previous.driver_id !== driverId) {
      await service
        .from("driver_profiles")
        .update({ current_order_id: null })
        .eq("id", previous.driver_id)
        .eq("current_order_id", orderId);
    }

    await service.from("driver_profiles").update({ current_order_id: orderId }).eq("id", driverId);

    await service.from("notifications").insert([
      {
        user_id: driverId,
        order_id: orderId,
        type: "driver_assigned",
        title: "You've been assigned a job",
        body: `Job EQ-${orderId.slice(0, 6).toUpperCase()} was assigned to you by the EcoQuick team.`,
      },
      ...(order.customer_id
        ? [
            {
              user_id: order.customer_id,
              order_id: orderId,
              type: "driver_assigned",
              title: "Driver assigned",
              body: `A driver has been assigned to your delivery EQ-${orderId.slice(0, 6).toUpperCase()}.`,
            },
          ]
        : []),
    ]);

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Admin assign-driver error:", message);
    return NextResponse.json({ error: "Failed to assign driver" }, { status: 500 });
  }
}
