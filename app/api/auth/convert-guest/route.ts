import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

/**
 * Upgrades the caller's anonymous Supabase session into a permanent customer
 * account — same auth.uid(), so their in-progress order keeps its customer_id.
 *
 * Uses the Auth Admin API with `email_confirm: true` so NO confirmation email
 * is ever sent (the booking funnel must not depend on an email link).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.is_anonymous) {
      // Already a permanent account — nothing to convert (double-submit guard).
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const fullName = String(body.full_name ?? "").trim();
    const phoneNumber = String(body.phone_number ?? "").trim();

    // Server-side validation (mirrors the signup form).
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include letters and numbers." },
        { status: 400 }
      );
    }
    if (fullName.length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (phoneNumber && !PHONE_RE.test(phoneNumber)) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }

    const service = createServiceClient();
    const { error } = await service.auth.admin.updateUserById(user.id, {
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "customer",
        phone_number: phoneNumber,
        verification_status: "unverified",
      },
    });

    if (error) {
      const msg = (error.message ?? "").toLowerCase();
      const taken =
        (error as { code?: string }).code === "email_exists" ||
        msg.includes("already been registered") ||
        msg.includes("already registered") ||
        msg.includes("duplicate");
      if (taken) {
        return NextResponse.json(
          {
            error: "EMAIL_TAKEN",
            message: "An account with this email already exists. Please log in instead.",
          },
          { status: 409 }
        );
      }
      console.error("convert-guest update error:", error);
      return NextResponse.json({ error: "Could not create your account. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("convert-guest error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
