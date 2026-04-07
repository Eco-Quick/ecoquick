import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = user.user_metadata?.verification_status || "unverified";

    // Get latest verification record
    const { data: verification } = await supabase
      .from("user_verifications")
      .select("id, method, status, document_type, rejection_reason, created_at, reviewed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ status, verification });
  } catch (error: unknown) {
    console.error("Verification status error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
