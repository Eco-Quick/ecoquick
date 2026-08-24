import { createServiceClient } from "@/lib/supabase/service";

// Best-effort server-side error logging — never throws, so a logging
// failure can't cascade into breaking the caller's actual request.
export async function logError(source: string, message: string, context?: Record<string, unknown>) {
  try {
    const service = createServiceClient();
    await service.from("error_log").insert({ source, message, context: context ?? {} });
  } catch (err) {
    console.error("[error-log] failed to record error:", err);
  }
}
