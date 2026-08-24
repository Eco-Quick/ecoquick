import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// Public — the booking flow reads current pricing from here instead of a
// hardcoded constant, so admin changes to /admin/pricing take effect
// immediately with no code deploy.
export async function GET() {
  const service = createServiceClient();
  const [bandsRes, surchargeRes] = await Promise.all([
    service.from("pricing_bands").select("label, up_to_miles, price").order("sort_order", { ascending: true }),
    service.from("pricing_surcharge").select("enabled, amount, reason").limit(1).maybeSingle(),
  ]);

  const bands =
    bandsRes.error || !bandsRes.data || bandsRes.data.length === 0
      ? [
          { label: "0–1 mile", up_to_miles: 1, price: 4.99 },
          { label: "1–3 miles", up_to_miles: 3, price: 5.99 },
          { label: "3–6 miles", up_to_miles: 6, price: 8.49 },
          { label: "6–8 miles", up_to_miles: 8, price: 10.99 },
        ]
      : bandsRes.data;

  if (bandsRes.error) {
    console.error("[pricing-bands] fetch failed, falling back to defaults:", bandsRes.error.message);
  }

  const surcharge = surchargeRes.data ?? { enabled: false, amount: 0, reason: null };

  return NextResponse.json({ bands, surcharge });
}
