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
    .from("pricing_bands")
    .select("*")
    .order("sort_order", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: "Failed to load pricing bands" }, { status: 500 });
  }
  return NextResponse.json({ bands: data });
}

// Body: { bands: [{ id, price }, ...] } — only price is editable per band;
// labels/boundaries stay fixed to keep the booking flow's copy consistent.
export async function PATCH(request: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const updates: { id?: string; price?: number }[] = body?.bands ?? [];
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "No bands provided" }, { status: 400 });
  }

  const service = createServiceClient();
  for (const b of updates) {
    const price = Number(b.price);
    if (!b.id || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Each band needs a valid id and price" }, { status: 400 });
    }
    const { error: updateError } = await service
      .from("pricing_bands")
      .update({ price, updated_at: new Date().toISOString(), updated_by: user!.id })
      .eq("id", b.id);
    if (updateError) {
      console.error("Update pricing band error:", updateError);
      return NextResponse.json({ error: "Failed to save one or more bands" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
