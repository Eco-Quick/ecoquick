import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// One-time-code lifetime for the /admin session gate. Re-required on every
// new sign-in (the cookie is cleared on logout).
const MFA_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request: NextRequest) {
  const { code } = await request.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user: preUser } } = await supabase.auth.getUser();

  if (!preUser || preUser.app_metadata?.role !== "admin" || !preUser.email) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: preUser.email,
    token: code.trim(),
    type: "email",
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Invalid or expired code" }, { status: 401 });
  }

  if (data.user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_mfa_verified", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: MFA_COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
