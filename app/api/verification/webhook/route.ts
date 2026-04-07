import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = Stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }

    const service = createServiceClient();

    if (event.type === "identity.verification_session.verified") {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const userId = session.metadata?.user_id;
      if (!userId) return NextResponse.json({ received: true });

      // Update verification record
      await service
        .from("user_verifications")
        .update({ status: "verified", reviewed_at: new Date().toISOString() })
        .eq("stripe_session_id", session.id);

      // Update user metadata
      await service.auth.admin.updateUserById(userId, {
        user_metadata: { verification_status: "verified" },
      });
    }

    if (event.type === "identity.verification_session.requires_input") {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const userId = session.metadata?.user_id;
      if (!userId) return NextResponse.json({ received: true });

      await service
        .from("user_verifications")
        .update({ status: "rejected", rejection_reason: "Document could not be verified. Please try again.", reviewed_at: new Date().toISOString() })
        .eq("stripe_session_id", session.id);

      await service.auth.admin.updateUserById(userId, {
        user_metadata: { verification_status: "rejected" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Verification webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
