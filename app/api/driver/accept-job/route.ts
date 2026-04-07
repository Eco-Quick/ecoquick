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

    // Verification gate (skip if dev bypass is on)
    const skipVerification = process.env.NEXT_PUBLIC_SKIP_VERIFICATION === "true";
    if (!skipVerification) {
      const verStatus = user.user_metadata?.verification_status;
      if (verStatus !== "verified") {
        return NextResponse.json({ error: "verification_required" }, { status: 403 });
      }
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const service = createServiceClient();

    // Age-restricted check for driver
    const AGE_RESTRICTED = ["alcohol", "tobacco"];
    const { data: orderCheck } = await service
      .from("delivery_orders")
      .select("product_category")
      .eq("id", orderId)
      .single();

    if (orderCheck && AGE_RESTRICTED.includes(orderCheck.product_category)) {
      if (!user.user_metadata?.is_over_18) {
        return NextResponse.json(
          { error: "age_restricted", message: "You must be 18+ to deliver this item" },
          { status: 403 }
        );
      }
    }

    // Atomic claim: only succeeds if order is still available
    const { data: order, error: updateErr } = await service
      .from("delivery_orders")
      .update({
        driver_id: user.id,
        status: "assigned",
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .is("driver_id", null)
      .eq("status", "confirmed")
      .select()
      .single();

    if (updateErr || !order) {
      console.error("Accept job update failed:", updateErr);
      return NextResponse.json(
        { error: "Job is no longer available", details: updateErr?.message || "No rows updated" },
        { status: 409 }
      );
    }

    // Update driver profile
    await service
      .from("driver_profiles")
      .update({ current_order_id: orderId })
      .eq("id", user.id);

    // Notify customer
    await service.from("notifications").insert({
      user_id: order.customer_id,
      order_id: orderId,
      type: "driver_assigned",
      title: "Driver assigned",
      body: `A driver has been assigned to your delivery EQ-${orderId.slice(0, 6).toUpperCase()}.`,
    });

    return NextResponse.json({ order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Accept job error:", message, error);
    return NextResponse.json({ error: "Failed to accept job", details: message }, { status: 500 });
  }
}
