import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendWhatsAppAlert } from "@/lib/notify/whatsapp";

type EventType = "login_attempt" | "signup" | "order_placed" | "van_interest";

const ALERT_MESSAGES: Record<EventType, (body: EventBody) => string> = {
  login_attempt: (b) =>
    b.success
      ? `EcoQuick: login by ${b.email ?? "unknown"}`
      : `EcoQuick: FAILED login attempt for ${b.email ?? "unknown"}`,
  signup: (b) => `EcoQuick: new signup — ${b.email ?? "unknown"} (${b.metadata?.role ?? "customer"})`,
  order_placed: (b) => {
    const van = b.metadata?.needs_van;
    const outOfRadius = b.metadata?.out_of_radius;
    if (van && outOfRadius) {
      return `EcoQuick: 🚐📍 VAN + OUT OF RADIUS — ${b.email ?? "a customer"} booked an order needing a van and outside the 8-mile Kingston radius. Contact them to arrange (order ${b.metadata?.order_id ?? "?"}).`;
    }
    if (van) {
      return `EcoQuick: 🚐 VAN NEEDED — ${b.email ?? "a customer"} booked an order too large for bike/car. Contact them to arrange (order ${b.metadata?.order_id ?? "?"}).`;
    }
    if (outOfRadius) {
      return `EcoQuick: 📍 OUT OF RADIUS — ${b.email ?? "a customer"} booked outside the 8-mile Kingston upon Thames radius. Contact them to see if it can be arranged (order ${b.metadata?.order_id ?? "?"}).`;
    }
    return `EcoQuick: new order placed by ${b.email ?? "a customer"}${
      b.metadata?.total_price ? ` — £${b.metadata.total_price}` : ""
    }`;
  },
  van_interest: (b) => {
    const name = b.metadata?.sender_name;
    const phone = b.metadata?.sender_phone;
    const who = [name, phone].filter(Boolean).join(" · ") || b.email || "a customer";
    return `EcoQuick: 🚐 Van interest — ${who} is filling out a delivery that needs a van (not submitted yet). May still complete it or drop off — check /admin/activity, or reach out now if you want to catch them early.`;
  },
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

  if (!body.event_type || !["login_attempt", "signup", "order_placed", "van_interest"].includes(body.event_type)) {
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

  // Awaited (not fire-and-forget): serverless functions can be frozen right
  // after the response is sent, which would kill an unawaited background call.
  await sendWhatsAppAlert(ALERT_MESSAGES[body.event_type](body));

  return NextResponse.json({ success: true });
}
