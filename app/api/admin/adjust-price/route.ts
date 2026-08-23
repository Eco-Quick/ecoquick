import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// Manually overrides an order's total_price (surge or discount, admin's call).
// Record-keeping only — does NOT touch Stripe. Payment for the adjusted
// amount is collected separately by the admin, same as van-coordination
// orders.
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

    const { orderId, newTotalPrice, reason } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }
    const price = Number(newTotalPrice);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Enter a valid price" }, { status: 400 });
    }

    const service = createServiceClient();
    const { data: order, error } = await service
      .from("delivery_orders")
      .update({
        total_price: price,
        price_adjustment_reason: reason || null,
        price_adjusted_at: new Date().toISOString(),
        price_adjusted_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id, total_price")
      .maybeSingle();

    if (error) {
      console.error("Adjust price error:", error);
      return NextResponse.json({ error: "Failed to update price" }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, totalPrice: order.total_price });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Admin adjust-price error:", message);
    return NextResponse.json({ error: "Failed to update price" }, { status: 500 });
  }
}
