"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ActiveOrder {
  id: string;
  status: string;
  pickup_address: string;
  pickup_city: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_address: string;
  delivery_city: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  product_category: string;
  package_size: string;
  weight: number;
  total_price: number;
  driver_instructions: string;
  scheduling_type: string;
  verification_code: string | null;
  assigned_at: string | null;
  picked_up_at: string | null;
  in_transit_at: string | null;
}

const STATUS_ACTIONS: Record<string, { label: string; next: string; icon: string }> = {
  assigned: { label: "Confirm Pickup", next: "picked_up", icon: "inventory_2" },
  picked_up: { label: "Start Delivery", next: "in_transit", icon: "local_shipping" },
  in_transit: { label: "Complete Delivery", next: "delivered", icon: "task_alt" },
};

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  assigned: { text: "Head to pickup", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  picked_up: { text: "Collect package", color: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  in_transit: { text: "Delivering", color: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
};

export default function DriverActiveDeliveryPage() {
  const router = useRouter();
  const [order, setOrder] = useState<ActiveOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => { fetchActiveOrder(); }, []);

  // Map init
  useEffect(() => {
    if (!order || !mapContainerRef.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token || (!order.pickup_lat && !order.delivery_lat)) return;

    import("mapbox-gl").then((mapboxgl) => {
      mapboxgl.default.accessToken = token;
      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [order.pickup_lng ?? -0.1276, order.pickup_lat ?? 51.5074],
        zoom: 13,
      });
      mapRef.current = map;

      map.on("load", () => {
        if (order.pickup_lat && order.pickup_lng) {
          const el = document.createElement("div");
          el.innerHTML = `<div style="background:#10b981;color:#fff;padding:4px 10px;font-size:11px;font-weight:700;border-radius:8px;">Pickup</div>`;
          new mapboxgl.default.Marker({ element: el }).setLngLat([order.pickup_lng, order.pickup_lat]).addTo(map);
        }
        if (order.delivery_lat && order.delivery_lng) {
          const el = document.createElement("div");
          el.innerHTML = `<div style="background:#3e0074;color:#fff;padding:4px 10px;font-size:11px;font-weight:700;border-radius:8px;">Dropoff</div>`;
          new mapboxgl.default.Marker({ element: el }).setLngLat([order.delivery_lng, order.delivery_lat]).addTo(map);
        }

        const coords: [number, number][] = [];
        if (order.pickup_lat && order.pickup_lng) coords.push([order.pickup_lng, order.pickup_lat]);
        if (order.delivery_lat && order.delivery_lng) coords.push([order.delivery_lng, order.delivery_lat]);
        if (coords.length >= 2) {
          const lngs = coords.map(c => c[0]), lats = coords.map(c => c[1]);
          map.fitBounds([[Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01], [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01]], { padding: 60 });

          fetch(`https://api.mapbox.com/directions/v5/mapbox/cycling/${order.pickup_lng},${order.pickup_lat};${order.delivery_lng},${order.delivery_lat}?geometries=geojson&access_token=${token}`)
            .then(r => r.json())
            .then(data => {
              if (data.routes?.[0]) {
                map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: data.routes[0].geometry } });
                map.addLayer({ id: "route", type: "line", source: "route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#3e0074", "line-width": 4, "line-opacity": 0.5 } });
              }
            }).catch(() => {});
        }
      });
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [order?.id]);

  // GPS tracking
  useEffect(() => {
    if (!order) return;
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setDriverPos(p);
          if (mapRef.current) {
            import("mapbox-gl").then((mapboxgl) => {
              if (driverMarkerRef.current) {
                driverMarkerRef.current.setLngLat([p.lng, p.lat]);
              } else {
                const el = document.createElement("div");
                el.innerHTML = `<div style="width:28px;height:28px;background:#3e0074;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.3);"></div>`;
                driverMarkerRef.current = new mapboxgl.default.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(mapRef.current!);
              }
            });
          }
        },
        () => {}, { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
    locationIntervalRef.current = setInterval(() => {
      if (driverPos) sendLocation(driverPos.lat, driverPos.lng);
    }, 10000);
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [order?.id]);

  async function sendLocation(lat: number, lng: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !order) return;
    await supabase.from("driver_locations").insert({ driver_id: user.id, order_id: order.id, lat, lng });
    await supabase.from("driver_profiles").update({ current_lat: lat, current_lng: lng }).eq("id", user.id);
  }

  async function fetchActiveOrder() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("delivery_orders")
      .select("id, status, pickup_address, pickup_city, pickup_lat, pickup_lng, delivery_address, delivery_city, delivery_lat, delivery_lng, sender_name, sender_phone, recipient_name, recipient_phone, product_category, package_size, weight, total_price, driver_instructions, scheduling_type, verification_code, assigned_at, picked_up_at, in_transit_at")
      .eq("driver_id", user.id)
      .in("status", ["assigned", "picked_up", "in_transit"])
      .order("assigned_at", { ascending: false })
      .limit(1)
      .single();
    setOrder(data);
    setLoading(false);
  }

  const handleStatusUpdate = useCallback(async () => {
    if (!order) return;
    const action = STATUS_ACTIONS[order.status];
    if (!action) return;
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/driver/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, newStatus: action.next }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to update status");
      if (action.next === "delivered") {
        router.push("/driver");
      } else {
        fetchActiveOrder();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setUpdating(false);
    }
  }, [order, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-[#3e0074] dark:text-[#c084fc]">progress_activity</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <span className="material-symbols-outlined text-3xl text-zinc-400">local_shipping</span>
        </div>
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No active delivery</p>
        <button
          onClick={() => router.push("/driver/jobs")}
          className="rounded-xl bg-[#3e0074] px-8 py-3 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] dark:bg-[#5b21b6]"
        >
          Find available jobs
        </button>
      </div>
    );
  }

  const action = STATUS_ACTIONS[order.status];
  const statusLabel = STATUS_LABELS[order.status];
  const orderId = `EQ-${order.id.slice(0, 6).toUpperCase()}`;
  const hasCoords = order.pickup_lat && order.delivery_lat;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">

        {/* Left panel */}
        <div className="w-full shrink-0 overflow-y-auto lg:h-full lg:w-[400px] lg:border-r lg:border-zinc-200 dark:lg:border-zinc-800">
          <div className="p-5 sm:p-6">

            {/* Order header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-zinc-400">Active Delivery</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-[#ede9f8]">{orderId}</p>
              </div>
              {statusLabel && (
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusLabel.color}`}>
                  {statusLabel.text}
                </span>
              )}
            </div>

            {/* Verification PIN */}
            {order.verification_code && (
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
                <div>
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Delivery PIN</p>
                  <p className="text-[11px] text-amber-600/70 dark:text-amber-400/60">Ask customer for this code</p>
                </div>
                <p className="font-mono text-2xl font-bold tracking-widest text-amber-700 dark:text-amber-400">{order.verification_code}</p>
              </div>
            )}

            {/* Route card */}
            <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div className="my-1 h-10 w-px bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full border-2 border-[#3e0074] dark:border-[#c084fc]" />
                </div>
                <div className="flex-1 space-y-5">
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-400">Pickup</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">{order.pickup_city}</p>
                    <p className="text-[12px] text-zinc-400">{order.pickup_address}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-400">Dropoff</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">{order.delivery_city}</p>
                    <p className="text-[12px] text-zinc-400">{order.delivery_address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sender */}
            <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                    <span className="material-symbols-outlined text-lg text-emerald-600">person</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-400">Sender (pickup)</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">{order.sender_name}</p>
                  </div>
                </div>
                <a
                  href={`tel:${order.sender_phone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
                >
                  <span className="material-symbols-outlined text-lg">call</span>
                </a>
              </div>
            </div>

            {/* Recipient */}
            <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span className="material-symbols-outlined text-lg text-zinc-500">person</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-400">Recipient (dropoff)</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">{order.recipient_name}</p>
                  </div>
                </div>
                <a
                  href={`tel:${order.recipient_phone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
                >
                  <span className="material-symbols-outlined text-lg">call</span>
                </a>
              </div>
            </div>

            {/* Package details */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-[#050507]">
                <p className="text-[10px] font-semibold text-zinc-400">Category</p>
                <p className="mt-1 text-[12px] font-bold text-zinc-700 dark:text-zinc-300">{order.product_category}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-[#050507]">
                <p className="text-[10px] font-semibold text-zinc-400">Size</p>
                <p className="mt-1 text-[12px] font-bold text-zinc-700 dark:text-zinc-300">{order.package_size}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-[#050507]">
                <p className="text-[10px] font-semibold text-zinc-400">Weight</p>
                <p className="mt-1 text-[12px] font-bold text-zinc-700 dark:text-zinc-300">{order.weight} kg</p>
              </div>
            </div>

            {/* Instructions */}
            {order.driver_instructions && (
              <div className="mb-4 rounded-2xl bg-zinc-50 p-4 dark:bg-[#050507]">
                <p className="mb-1 text-[11px] font-semibold text-zinc-400">Instructions</p>
                <p className="text-[13px] italic text-zinc-600 dark:text-zinc-300">&ldquo;{order.driver_instructions}&rdquo;</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}

            {/* Action button */}
            {action && (
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="w-full rounded-xl bg-[#3e0074] py-4 text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] disabled:opacity-60 dark:bg-[#5b21b6]"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">{action.icon}</span>
                  {updating ? "Updating…" : action.label}
                </span>
              </button>
            )}

            {/* Earnings preview */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-[#050507]">
              <span className="text-[12px] text-zinc-400">You earn</span>
              <span className="text-sm font-bold text-[#3e0074] dark:text-[#c084fc]">£{(Number(order.total_price) * 0.8).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right panel — Map */}
        <div className="relative h-[400px] flex-1 lg:h-auto">
          <div ref={mapContainerRef} className="absolute inset-0" />
          {!hasCoords && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-100 dark:bg-[#0c0b14]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
                <span className="material-symbols-outlined text-3xl text-zinc-400">map</span>
              </div>
              <p className="text-sm font-semibold text-zinc-400">Map loading...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
