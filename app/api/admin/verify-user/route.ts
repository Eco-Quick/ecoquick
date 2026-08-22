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

    // Check admin role
    if (user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, action, reason } = await request.json();
    if (!userId || !action) {
      return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
    }

    const service = createServiceClient();
    const now = new Date().toISOString();

    if (action === "approve") {
      await service
        .from("user_verifications")
        .update({ status: "verified", reviewed_at: now })
        .eq("user_id", userId)
        .eq("status", "pending");

      await service.auth.admin.updateUserById(userId, {
        user_metadata: { verification_status: "verified" },
      });
    } else if (action === "reject") {
      await service
        .from("user_verifications")
        .update({ status: "rejected", rejection_reason: reason || "Document not accepted", reviewed_at: now })
        .eq("user_id", userId)
        .eq("status", "pending");

      await service.auth.admin.updateUserById(userId, {
        user_metadata: { verification_status: "rejected" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Admin verify error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
