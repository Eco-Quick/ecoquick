import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { logError } from "@/lib/error-log";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { path?: string; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const path = (body.path ?? "").slice(0, 500);
  const sessionId = (body.sessionId ?? "").slice(0, 100);
  if (!path || !sessionId) {
    return NextResponse.json({ error: "Missing path or sessionId" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service.from("page_views").insert({ path, session_id: sessionId });

  if (error) {
    console.error("[track/pageview] insert failed:", error.message);
    await logError("track/pageview", error.message, { path, sessionId });
    return NextResponse.json({ error: "Failed to record page view" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
