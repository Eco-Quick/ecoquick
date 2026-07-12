"use client";

import { useEffect, useRef } from "react";
import type mapboxgl from "mapbox-gl";

const KINGSTON_CENTER: [number, number] = [-0.3007, 51.4123];

const TIER_COLORS = {
  inner: "#9a3412", // deep orange (orange-800)
  mid: "#ea580c",   // orange-600
  outer: "#fb923c", // orange-400
} as const;

type Tier = keyof typeof TIER_COLORS;

// Areas within ~8 miles of Kingston upon Thames, banded by straight-line distance.
const NEIGHBORHOODS: { name: string; coords: [number, number]; tier: Tier }[] = [
  // 0–3 miles
  { name: "Norbiton", coords: [-0.2864, 51.4137], tier: "inner" },
  { name: "Surbiton", coords: [-0.3034, 51.3925], tier: "inner" },
  { name: "Hampton Wick", coords: [-0.3243, 51.4135], tier: "inner" },
  { name: "Teddington", coords: [-0.3309, 51.4257], tier: "inner" },
  { name: "Ham", coords: [-0.3146, 51.4422], tier: "inner" },
  { name: "St Margarets", coords: [-0.3260, 51.4522], tier: "inner" },
  { name: "Twickenham", coords: [-0.3299, 51.4467], tier: "inner" },
  { name: "Hampton", coords: [-0.3679, 51.4146], tier: "inner" },
  { name: "New Malden", coords: [-0.2566, 51.4051], tier: "inner" },
  { name: "Tolworth", coords: [-0.2812, 51.3791], tier: "inner" },
  { name: "Old Malden", coords: [-0.2560, 51.3830], tier: "inner" },
  { name: "Motspur Park", coords: [-0.2405, 51.3906], tier: "inner" },
  { name: "Raynes Park", coords: [-0.2310, 51.4097], tier: "inner" },
  { name: "Thames Ditton", coords: [-0.3308, 51.3894], tier: "inner" },
  { name: "East Molesey", coords: [-0.3540, 51.4030], tier: "inner" },
  // 3–5 miles
  { name: "Richmond", coords: [-0.3037, 51.4613], tier: "mid" },
  { name: "Roehampton", coords: [-0.2440, 51.4560], tier: "mid" },
  { name: "Southfields", coords: [-0.2065, 51.4448], tier: "mid" },
  { name: "Barnes", coords: [-0.2430, 51.4730], tier: "mid" },
  { name: "Putney", coords: [-0.2160, 51.4613], tier: "mid" },
  { name: "Wimbledon", coords: [-0.2056, 51.4214], tier: "mid" },
  { name: "Morden", coords: [-0.1980, 51.4020], tier: "mid" },
  { name: "Worcester Park", coords: [-0.2453, 51.3808], tier: "mid" },
  { name: "Chessington", coords: [-0.3000, 51.3593], tier: "mid" },
  { name: "Esher", coords: [-0.3675, 51.3713], tier: "mid" },
  { name: "Hinchley Wood", coords: [-0.3430, 51.3760], tier: "mid" },
  { name: "Claygate", coords: [-0.3560, 51.3600], tier: "mid" },
  { name: "West Molesey", coords: [-0.3760, 51.3990], tier: "mid" },
  // 5–8 miles
  { name: "Wandsworth", coords: [-0.1910, 51.4570], tier: "outer" },
  { name: "Sutton", coords: [-0.1980, 51.3750], tier: "outer" },
  { name: "Hersham", coords: [-0.4020, 51.3690], tier: "outer" },
  { name: "Walton-on-Thames", coords: [-0.4080, 51.3840], tier: "outer" },
  { name: "Cobham", coords: [-0.3950, 51.3450], tier: "outer" },
];

const PULSE_STYLE_ID = "ecoquick-pulse-style";
const PULSE_CSS = `
  @keyframes ecoquick-pulse {
    0%   { transform: scale(1);   opacity: 0.55; }
    80%  { transform: scale(2.6); opacity: 0;    }
    100% { transform: scale(2.6); opacity: 0;    }
  }
`;

export default function CoverageMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error("[CoverageMap] Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN");
      return;
    }
    if (!containerRef.current) return;

    if (!document.getElementById(PULSE_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = PULSE_STYLE_ID;
      style.textContent = PULSE_CSS;
      document.head.appendChild(style);
    }

    let cancelled = false;

    import("mapbox-gl").then((mb) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      mb.default.accessToken = token;

      const map = new mb.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: KINGSTON_CENTER,
        zoom: 10.6,
        scrollZoom: false,
        attributionControl: false,
      });
      mapRef.current = map;

      map.addControl(new mb.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        map.resize();

        // Kingston center marker — purple pin, label above
        const centerEl = document.createElement("div");
        centerEl.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
            <div style="background:#3e0074;color:#fff;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;box-shadow:0 4px 12px rgba(62,0,116,0.35);white-space:nowrap;">Kingston upon Thames</div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #3e0074;"></div>
            <div style="width:14px;height:14px;background:#3e0074;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>
          </div>
        `;
        new mb.default.Marker({ element: centerEl, anchor: "bottom" }).setLngLat(KINGSTON_CENTER).addTo(map);

        // Animated tier dots — pulse ring + solid core
        NEIGHBORHOODS.forEach((n) => {
          const color = TIER_COLORS[n.tier];
          const el = document.createElement("div");
          el.style.cssText = "position:relative;width:14px;height:14px;pointer-events:none;";
          el.innerHTML = `
            <span style="position:absolute;inset:0;border-radius:50%;background:${color};animation:ecoquick-pulse 2s ease-out infinite;"></span>
            <span style="position:absolute;inset:3px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.25);"></span>
          `;
          new mb.default.Marker({ element: el, anchor: "center" }).setLngLat(n.coords).addTo(map);
        });

        // Text labels via Mapbox's native symbol layer (collision-aware)
        map.addSource("neighborhood-labels", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: NEIGHBORHOODS.map((n) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: n.coords },
              properties: { name: n.name },
            })),
          },
        });

        map.addLayer({
          id: "neighborhood-labels",
          type: "symbol",
          source: "neighborhood-labels",
          layout: {
            "text-field": ["get", "name"],
            "text-size": 11,
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.1],
            "text-anchor": "top",
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "text-padding": 4,
          },
          paint: {
            "text-color": "#1f2937",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.6,
          },
        });
      });

      map.on("error", (e) => {
        console.error("[CoverageMap] Mapbox error:", e);
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-[#3d3455] md:h-[440px]">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
