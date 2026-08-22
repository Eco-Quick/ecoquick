import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sends a one-time email code to the current admin's own address, using
// Supabase Auth's built-in email-OTP delivery (no separate email service).
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin" || !user.email) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
