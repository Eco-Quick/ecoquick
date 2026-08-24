import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type CheckResult = { name: string; ok: boolean; latencyMs: number | null; detail: string };

async function timed<T>(fn: () => PromiseLike<T>): Promise<{ result: T | null; latencyMs: number; error: string | null }> {
  const start = Date.now();
  try {
    const result = await fn();
    return { result, latencyMs: Date.now() - start, error: null };
  } catch (err) {
    return { result: null, latencyMs: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  }
}

async function checkDatabase(): Promise<CheckResult> {
  const service = createServiceClient();
  const { latencyMs, error } = await timed(() =>
    service.from("delivery_orders").select("id", { count: "exact", head: true })
  );
  return {
    name: "Database",
    ok: !error,
    latencyMs,
    detail: error ?? "Reachable",
  };
}

async function checkStripe(): Promise<CheckResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { name: "Stripe", ok: false, latencyMs: null, detail: "STRIPE_SECRET_KEY not set" };
  }
  const { latencyMs, error } = await timed(async () => {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    return stripe.balance.retrieve();
  });
  return {
    name: "Stripe",
    ok: !error,
    latencyMs,
    detail: error ?? "Key valid",
  };
}

async function checkPostcodeLookup(): Promise<CheckResult> {
  const { latencyMs, error, result } = await timed(async () => {
    const res = await fetch("https://api.postcodes.io/postcodes/KT11QT");
    if (!res.ok) throw new Error(`postcodes.io returned ${res.status}`);
    return res.json();
  });
  return {
    name: "Postcode lookup",
    ok: !error && !!result,
    latencyMs,
    detail: error ?? "Reachable",
  };
}

function checkWhatsAppConfig(): CheckResult {
  const configured = !!(process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_API_KEY);
  return {
    name: "WhatsApp alerts",
    ok: configured,
    latencyMs: null,
    detail: configured ? "Configured" : "CALLMEBOT_PHONE / CALLMEBOT_API_KEY not set",
  };
}

function checkMapbox(): CheckResult {
  const configured = !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  return {
    name: "Mapbox (live tracking)",
    ok: configured,
    latencyMs: null,
    detail: configured ? "Configured" : "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN not set",
  };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();

  const [db, stripe, postcode, recentErrors, liveVisitors, pageViewsToday, recentPageViews] = await Promise.all([
    checkDatabase(),
    checkStripe(),
    checkPostcodeLookup(),
    service
      .from("error_log")
      .select("id, source, message, context, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    service
      .from("page_views")
      .select("session_id")
      .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()),
    service
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    service
      .from("page_views")
      .select("id, path, session_id, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const whatsapp = checkWhatsAppConfig();
  const mapbox = checkMapbox();

  const liveVisitorCount = new Set((liveVisitors.data ?? []).map((r) => r.session_id)).size;

  return NextResponse.json({
    checks: [db, stripe, postcode, whatsapp, mapbox],
    site: { ok: true, detail: "Serving requests" },
    liveVisitorCount,
    pageViewsToday: pageViewsToday.count ?? 0,
    recentPageViews: recentPageViews.data ?? [],
    recentErrors: recentErrors.data ?? [],
    checkedAt: new Date().toISOString(),
  });
}
