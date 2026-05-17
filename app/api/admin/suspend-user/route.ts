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

    const { userId, action } = await request.json();
    if (!userId || !["suspend", "unsuspend"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json(
        { error: "Cannot suspend your own admin account" },
        { status: 400 }
      );
    }

    const service = createServiceClient();
    const { data: target } = await service.auth.admin.getUserById(userId);
    if (!target?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const nextMeta = {
      ...(target.user.user_metadata ?? {}),
      suspended: action === "suspend",
    };

    // ban_duration sets a Supabase Auth ban; "none" lifts it
    await service.auth.admin.updateUserById(userId, {
      user_metadata: nextMeta,
      ban_duration: action === "suspend" ? "876000h" : "none",
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Suspend user error:", message);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
