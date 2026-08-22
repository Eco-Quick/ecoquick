import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendWhatsAppAlert } from "@/lib/notify/whatsapp";

type EventType = "login_attempt" | "signup" | "order_placed";

const ALERT_MESSAGES: Record<EventType, (body: EventBody) => string> = {
  login_attempt: (b) =>
    b.success
      ? `EcoQuick: login by ${b.email ?? "unknown"}`
      : `EcoQuick: FAILED login attempt for ${b.email ?? "unknown"}`,
  signup: (b) => `EcoQuick: new signup — ${b.email ?? "unknown"} (${b.metadata?.role ?? "customer"})`,
  order_placed: (b) =>
    `EcoQuick: new order placed by ${b.email ?? "a customer"}${
      b.metadata?.total_price ? ` — £${b.metadata.total_price}` : ""
    }`,
};

type EventBody = {
  event_type: EventType;
  success?: boolean;
  email?: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  let body: EventBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.event_type || !["login_attempt", "signup", "order_placed"].includes(body.event_type)) {
    return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("security_events").insert({
    event_type: body.event_type,
    success: body.success ?? null,
    email: body.email ?? null,
    user_id: body.user_id ?? null,
    metadata: body.metadata ?? {},
  });

  if (error) {
    console.error("[track/event] insert failed:", error.message);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }

  // Fire-and-forget: don't block the response on the WhatsApp call.
  sendWhatsAppAlert(ALERT_MESSAGES[body.event_type](body)).catch(() => {});

  return NextResponse.json({ success: true });
}
