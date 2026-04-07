import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already verified
    if (user.user_metadata?.verification_status === "verified") {
      return NextResponse.json({ status: "already_verified" });
    }

    // Try Stripe Identity
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.identity.verificationSessions.create({
          type: "document",
          metadata: { user_id: user.id },
          options: {
            document: {
              allowed_types: ["passport", "driving_license"],
            },
          },
        });

        // Record in DB
        const service = createServiceClient();
        await service.from("user_verifications").insert({
          user_id: user.id,
          method: "stripe_identity",
          status: "pending",
          stripe_session_id: session.id,
        });

        return NextResponse.json({
          method: "stripe_identity",
          clientSecret: session.client_secret,
          sessionId: session.id,
        });
      } catch (stripeErr: unknown) {
        // Stripe Identity not available on this plan — fall back to manual
        console.warn("Stripe Identity unavailable, falling back to manual upload:", stripeErr);
      }
    }

    // Fallback: manual upload
    return NextResponse.json({ method: "manual_upload" });
  } catch (error: unknown) {
    console.error("Verification session error:", error);
    return NextResponse.json({ error: "Failed to create verification session" }, { status: 500 });
  }
}
