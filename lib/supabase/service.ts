import { createClient } from "@supabase/supabase-js";

function assertServiceRoleKey(): string {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = typeof raw === "string" ? raw.trim() : "";
  // Service role secret is a JWT (three dot-separated base64url segments)
  if (!key || !key.startsWith("eyJ") || key.split(".").length !== 3) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing or invalid (expected a JWT from Supabase Dashboard → Settings → API → service_role)."
    );
  }
  return key;
}

/**
 * Service role client — bypasses RLS.
 * Only use server-side (API routes, webhooks). Never expose to the browser.
 */
export function createServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, assertServiceRoleKey());
}
