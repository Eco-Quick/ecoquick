import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// Public — the booking flow reads current pricing from here instead of a
// hardcoded constant, so admin changes to /admin/pricing take effect
// immediately with no code deploy.
export async function GET() {
  const service = createServiceClient();
  const { data, error } = await service
    .from("pricing_bands")
    .select("label, up_to_miles, price")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    console.error("[pricing-bands] fetch failed, falling back to defaults:", error?.message);
    return NextResponse.json({
      bands: [
        { label: "0–1 mile", up_to_miles: 1, price: 4.99 },
        { label: "1–3 miles", up_to_miles: 3, price: 5.99 },
        { label: "3–6 miles", up_to_miles: 6, price: 8.49 },
        { label: "6–8 miles", up_to_miles: 8, price: 10.99 },
      ],
    });
  }

  return NextResponse.json({ bands: data });
}
