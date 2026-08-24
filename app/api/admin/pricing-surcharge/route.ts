import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.app_metadata?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const service = createServiceClient();
  const { data, error: dbError } = await service
    .from("pricing_surcharge")
    .select("id, enabled, amount, reason, updated_at")
    .limit(1)
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: "Failed to load surcharge" }, { status: 500 });
  return NextResponse.json({ surcharge: data });
}

// Body: { id, enabled, amount, reason }
export async function PATCH(request: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const id = body?.id;
  const enabled = Boolean(body?.enabled);
  const amount = Number(body?.amount);
  const reason = typeof body?.reason === "string" ? body.reason.trim() : null;

  if (!id || !Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: "Invalid id or amount" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error: updateError } = await service
    .from("pricing_surcharge")
    .update({
      enabled,
      amount,
      reason: reason || null,
      updated_at: new Date().toISOString(),
      updated_by: user!.id,
    })
    .eq("id", id);

  if (updateError) {
    console.error("Update pricing surcharge error:", updateError);
    return NextResponse.json({ error: "Failed to save surcharge" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
