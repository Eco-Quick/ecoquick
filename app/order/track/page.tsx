"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";

interface TrackedOrder {
  id: string;
  status: string;
  driver_id: string | null;
  pickup_address: string;
  pickup_city: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_address: string;
  delivery_city: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  weight: number;
  total_price: number;
  scheduling_type: string;
  created_at: string;
  assigned_at: string | null;
  picked_up_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  verification_code: string | null;
  driver_profiles: {
    full_name: string;
    vehicle_type: string;
    rating: number;
    current_lat: number | null;
    current_lng: number | null;
  } | null;
}

const TIMELINE_STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: "check_circle", tsField: "created_at", desc: "Payment verified" },
  { key: "assigned", label: "Driver Assigned", icon: "person", tsField: "assigned_at", desc: "Driver en route to pickup" },
  { key: "picked_up", label: "Picked Up", icon: "inventory_2", tsField: "picked_up_at", desc: "Package collected" },
  { key: "in_transit", label: "On the Way", icon: "local_shipping", tsField: "in_transit_at", desc: "Heading to you" },
  { key: "delivered", label: "Delivered", icon: "task_alt", tsField: "delivered_at", desc: "Handed to recipient" },
];

const STATUS_ORDER = ["pending", "confirmed", "assigned", "picked_up", "in_transit", "delivered"];

export default function OrderTrackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#050507]"><span className="material-symbols-outlined animate-spin text-3xl text-[#3e0074] dark:text-[#c084fc]">progress_activity</span></div>}>
      <OrderTrackContent />
    </Suspense>
  );
}

function OrderTrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const user = useCustomerAuth();

  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!orderId || !user) return;
    fetchOrder();
  }, [orderId, user?.id]);

  // Realtime subscriptions
  useEffect(() => {
    if (!orderId) return;
    const supabase = createClient();

    const orderChannel = supabase
      .channel(`track-order-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "delivery_orders", filter: `id=eq.${orderId}` }, () => { fetchOrder(); })
      .subscribe();

    const locationChannel = supabase
      .channel(`track-location-${orderId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "driver_locations", filter: `order_id=eq.${orderId}` }, (payload) => {
        const loc = payload.new as { lat: number; lng: number };
        updateDriverMarkerOnMap(loc.lat, loc.lng);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(locationChannel);
    };
  }, [orderId]);

  // Initialize map
  useEffect(() => {
    if (!order || !mapContainerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;

    // Need at least one set of coordinates
    if (!order.pickup_lat && !order.delivery_lat) return;

    import("mapbox-gl").then((mapboxgl) => {
      mapboxgl.default.accessToken = token;

      const center: [number, number] = [
        order.delivery_lng ?? order.pickup_lng ?? -0.1276,
        order.delivery_lat ?? order.pickup_lat ?? 51.5074,
      ];

      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center,
        zoom: 12,
      });
      mapRef.current = map;

      map.on("load", () => {
        if (order.pickup_lat && order.pickup_lng) {
          const el = document.createElement("div");
          el.innerHTML = `<div style="background:#10b981;color:#fff;padding:4px 10px;font-size:11px;font-weight:700;border-radius:8px;white-space:nowrap;">Pickup</div>`;
          new mapboxgl.default.Marker({ element: el }).setLngLat([order.pickup_lng!, order.pickup_lat]).addTo(map);
        }
        if (order.delivery_lat && order.delivery_lng) {
          const el = document.createElement("div");
          el.innerHTML = `<div style="background:#3e0074;color:#fff;padding:4px 10px;font-size:11px;font-weight:700;border-radius:8px;white-space:nowrap;">Delivery</div>`;
          new mapboxgl.default.Marker({ element: el }).setLngLat([order.delivery_lng!, order.delivery_lat]).addTo(map);
        }

        // Driver marker
        const dLat = order.driver_profiles?.current_lat;
        const dLng = order.driver_profiles?.current_lng;
        if (dLat && dLng) {
          const el = document.createElement("div");
          el.innerHTML = `<div style="width:32px;height:32px;background:#3e0074;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span class="material-symbols-outlined" style="font-size:16px;color:#fff;">pedal_bike</span></div>`;
          driverMarkerRef.current = new mapboxgl.default.Marker({ element: el }).setLngLat([dLng, dLat]).addTo(map);
        }

        // Fit bounds
        const coords: [number, number][] = [];
        if (order.pickup_lat && order.pickup_lng) coords.push([order.pickup_lng, order.pickup_lat]);
        if (order.delivery_lat && order.delivery_lng) coords.push([order.delivery_lng, order.delivery_lat]);
        if (dLat && dLng) coords.push([dLng, dLat]);

        if (coords.length >= 2) {
          const lngs = coords.map(c => c[0]);
          const lats = coords.map(c => c[1]);
          map.fitBounds([[Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01], [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01]], { padding: 60 });
        }

        // Route line
        if (order.pickup_lat && order.pickup_lng && order.delivery_lat && order.delivery_lng) {
          fetch(`https://api.mapbox.com/directions/v5/mapbox/cycling/${order.pickup_lng},${order.pickup_lat};${order.delivery_lng},${order.delivery_lat}?geometries=geojson&access_token=${token}`)
            .then(r => r.json())
            .then(data => {
              if (data.routes?.[0]) {
                setDistance(Math.round(data.routes[0].distance / 100) / 10);
                setEta(`${Math.round(data.routes[0].duration / 60)}`);
                map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: data.routes[0].geometry } });
                map.addLayer({ id: "route", type: "line", source: "route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#3e0074", "line-width": 4, "line-opacity": 0.5 } });
              }
            }).catch(() => {});
        }
      });
    });

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [order?.id]);

  function updateDriverMarkerOnMap(lat: number, lng: number) {
    if (!mapRef.current) return;
    import("mapbox-gl").then((mapboxgl) => {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLngLat([lng, lat]);
      } else {
        const el = document.createElement("div");
        el.innerHTML = `<div style="width:32px;height:32px;background:#3e0074;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 12px rgba(0,0,0,0.3);"></div>`;
        driverMarkerRef.current = new mapboxgl.default.Marker({ element: el }).setLngLat([lng, lat]).addTo(mapRef.current!);
      }
    });
  }

  async function fetchOrder() {
    if (!orderId) return;
    const supabase = createClient();

    const { data, error: err } = await supabase
      .from("delivery_orders")
      .select("id, status, pickup_address, pickup_city, pickup_lat, pickup_lng, delivery_address, delivery_city, delivery_lat, delivery_lng, weight, total_price, scheduling_type, created_at, assigned_at, picked_up_at, in_transit_at, delivered_at, verification_code, driver_id")
      .eq("id", orderId)
      .single();

    if (err || !data) { setError("Order not found"); setLoading(false); return; }

    let driverProfile = null;
    if (data.driver_id) {
      const { data: dp } = await supabase
        .from("driver_profiles")
        .select("full_name, vehicle_type, rating, current_lat, current_lng")
        .eq("id", data.driver_id)
        .single();
      driverProfile = dp;
    }

    setOrder({ ...data, driver_profiles: driverProfile } as unknown as TrackedOrder);
    setLoading(false);
  }

  function formatTime(ts: string | null) {
    if (!ts) return null;
    return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function getStepStatus(stepKey: string, orderStatus: string): "completed" | "active" | "pending" {
    const stepIdx = STATUS_ORDER.indexOf(stepKey);
    const currentIdx = STATUS_ORDER.indexOf(orderStatus);
    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#050507]">
        <span className="material-symbols-outlined animate-spin text-3xl text-[#3e0074] dark:text-[#c084fc]">progress_activity</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-[#050507]">
        <span className="material-symbols-outlined text-5xl text-zinc-300">error_outline</span>
        <p className="font-semibold text-zinc-500">{error || "Order not found"}</p>
        <Link href="/orders" className="text-sm font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">View all orders</Link>
      </div>
    );
  }

  const driver = order.driver_profiles;
  const co2Saved = (order.weight * 0.15).toFixed(1);
  const isDelivered = order.status === "delivered";
  const hasCoords = order.pickup_lat && order.delivery_lat;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050507]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-[#050507]/90 sm:px-6">
        <button onClick={() => router.push("/orders")} className="flex items-center gap-2 text-[13px] font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Orders
        </button>
        <span className="font-mono text-[12px] font-semibold text-zinc-400 dark:text-zinc-500">
          EQ-{order.id.slice(0, 6).toUpperCase()}
        </span>
        <button onClick={() => router.push("/dashboard")} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden lg:flex-row" style={{ height: "calc(100vh - 56px)" }}>
        {/* Left panel — info */}
        <div className="w-full shrink-0 overflow-y-auto lg:h-full lg:w-[420px] lg:border-r lg:border-zinc-200 dark:lg:border-zinc-800">
          <div className="p-5 sm:p-6">

            {/* Status card */}
            <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold ${
                    isDelivered
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-[#3e0074]/10 text-[#3e0074] dark:bg-[#c084fc]/10 dark:text-[#c084fc]"
                  }`}>
                    {!isDelivered && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
                    {isDelivered ? "Delivered" : "Live Tracking"}
                  </div>
                  {eta && !isDelivered && (
                    <p className="mt-3 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8]">
                      {eta} <span className="text-base font-medium text-zinc-400">min</span>
                    </p>
                  )}
                  {isDelivered && (
                    <p className="mt-3 text-xl font-bold text-emerald-600">Delivery complete</p>
                  )}
                </div>
                <div className="text-right">
                  {distance && (
                    <div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">{distance} km</p>
                      <p className="text-[11px] text-zinc-400">distance</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verification PIN */}
            {order.verification_code && !isDelivered && (
              <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#3e0074]/20 bg-[#3e0074]/5 p-5 dark:border-[#c084fc]/20 dark:bg-[#c084fc]/5">
                <div>
                  <p className="text-[11px] font-bold text-[#3e0074] dark:text-[#c084fc]">Your Delivery PIN</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Share this with the driver</p>
                </div>
                <p className="font-mono text-3xl font-bold tracking-widest text-[#3e0074] dark:text-[#c084fc]">{order.verification_code}</p>
              </div>
            )}

            {/* Driver card */}
            {driver && (
              <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0c0b14]">
                <p className="mb-3 text-[11px] font-semibold uppercase text-zinc-400">Your driver</p>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3e0074] text-white dark:bg-[#5b21b6]">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">{driver.full_name}</p>
                    <div className="flex items-center gap-2 text-[12px] text-zinc-400">
                      <span>{driver.vehicle_type}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs text-amber-400">star</span>
                        {Number(driver.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!driver && !isDelivered && (
              <div className="mb-5 rounded-2xl border border-dashed border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-[#0c0b14]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-lg text-amber-500">progress_activity</span>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Finding a driver nearby...</p>
                </div>
              </div>
            )}

            {/* Route */}
            <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div className="my-1 h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full border-2 border-[#3e0074] dark:border-[#c084fc]" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-400">Pickup</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">{order.pickup_city}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-400">Delivery</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-[#ede9f8]">{order.delivery_city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0c0b14]">
              <p className="mb-4 text-[11px] font-semibold uppercase text-zinc-400">Order journey</p>
              <div className="space-y-6">
                {TIMELINE_STEPS.map((step, i) => {
                  const stepStatus = getStepStatus(step.key, order.status);
                  const ts = (order as unknown as Record<string, unknown>)[step.tsField] as string | null;
                  const isLast = i === TIMELINE_STEPS.length - 1;
                  return (
                    <div key={step.key} className="relative flex gap-4">
                      {!isLast && (
                        <div className={`absolute left-[13px] top-[28px] h-[calc(100%)] w-px ${
                          stepStatus === "completed" ? "bg-[#3e0074] dark:bg-[#c084fc]" : "bg-zinc-200 dark:bg-zinc-700"
                        }`} />
                      )}
                      <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        stepStatus === "completed"
                          ? "bg-[#3e0074] text-white dark:bg-[#c084fc] dark:text-[#050507]"
                          : stepStatus === "active"
                            ? "border-2 border-[#3e0074] bg-white text-[#3e0074] dark:border-[#c084fc] dark:bg-[#050507] dark:text-[#c084fc]"
                            : "border border-zinc-200 bg-white text-zinc-300 dark:border-zinc-700 dark:bg-[#050507]"
                      }`}>
                        <span className="material-symbols-outlined text-sm">{step.icon}</span>
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-baseline justify-between">
                          <p className={`text-sm font-semibold ${
                            stepStatus === "pending" ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-900 dark:text-[#ede9f8]"
                          }`}>{step.label}</p>
                          <span className={`text-[11px] ${stepStatus === "pending" ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-400"}`}>
                            {ts ? formatTime(ts) : ""}
                          </span>
                        </div>
                        <p className={`text-[12px] ${stepStatus === "pending" ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-400"}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#0c0b14]">
                <p className="text-[11px] font-semibold text-zinc-400">CO₂ Saved</p>
                <p className="mt-1 text-lg font-bold text-emerald-600">{co2Saved} kg</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#0c0b14]">
                <p className="text-[11px] font-semibold text-zinc-400">Price</p>
                <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">£{order.total_price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — Map */}
        <div className="relative h-[400px] flex-1 lg:h-auto">
          <div ref={mapContainerRef} className="absolute inset-0" />
          {/* Fallback overlay when map can't render */}
          {!hasCoords && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-100 dark:bg-[#0c0b14]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
                <span className="material-symbols-outlined text-3xl text-zinc-400">map</span>
              </div>
              <p className="text-sm font-semibold text-zinc-400">Map available when driver is en route</p>
              <p className="max-w-xs text-center text-[12px] text-zinc-400">
                The live map will appear here once a driver picks up your order and starts the delivery.
              </p>
            </div>
          )}

          {/* WhatsApp help button */}
          <a
            href="https://wa.me/447417366028?text=Hi%20EcoQuick!%20I%20need%20help%20with%20my%20delivery."
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.4)] transition-all hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}
