import { createClient } from "@supabase/supabase-js";

function assertServiceRoleKey(): string {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = typeof raw === "string" ? raw.trim() : "";
  // Accepts either the legacy JWT service_role key (three dot-separated
  // base64url segments) or Supabase's newer sb_secret_... API key format.
  const isLegacyJwt = key.startsWith("eyJ") && key.split(".").length === 3;
  const isNewSecretKey = key.startsWith("sb_secret_");
  if (!key || (!isLegacyJwt && !isNewSecretKey)) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing or invalid (expected a service_role JWT or sb_secret_... key from Supabase Dashboard → Settings → API)."
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
