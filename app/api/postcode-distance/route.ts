import { NextResponse } from "next/server";

// Straight-line distance between two UK postcodes, computed from free/keyless
// postcodes.io centroid lookups — no Mapbox, no API key. Used to restore
// distance-based pricing after the address fields became plain manual entry.

function haversineDistanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type PostcodesIoResult = {
  query: string;
  result: { postcode: string; latitude: number; longitude: number } | null;
};

// UK postcodes are outward-code + single-space + 3-character inward code.
// Users type spacing inconsistently (no space, double space, misplaced
// space) — strip all whitespace and re-insert it in the correct place so
// postcodes.io (which is strict about format) can still resolve it.
function normalizePostcode(raw: string): string {
  const compact = raw.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export async function POST(request: Request) {
  let body: { pickupPostcode?: string; dropoffPostcode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pickup = normalizePostcode(body.pickupPostcode ?? "");
  const dropoff = normalizePostcode(body.dropoffPostcode ?? "");

  if (!pickup || !dropoff) {
    return NextResponse.json({ error: "Both postcodes are required" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.postcodes.io/postcodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcodes: [pickup, dropoff] }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
    }

    const json: { result: PostcodesIoResult[] } = await res.json();
    const pickupResult = json.result.find((r) => r.query === pickup)?.result;
    const dropoffResult = json.result.find((r) => r.query === dropoff)?.result;

    if (!pickupResult || !dropoffResult) {
      return NextResponse.json({ error: "One or both postcodes not found" }, { status: 404 });
    }

    const distanceMiles = haversineDistanceMiles(
      pickupResult.latitude,
      pickupResult.longitude,
      dropoffResult.latitude,
      dropoffResult.longitude
    );

    return NextResponse.json({
      distanceMiles,
      pickupLat: pickupResult.latitude,
      pickupLng: pickupResult.longitude,
      dropoffLat: dropoffResult.latitude,
      dropoffLng: dropoffResult.longitude,
    });
  } catch (err) {
    console.error("[postcode-distance] lookup errored:", err);
    return NextResponse.json({ error: "Lookup errored" }, { status: 500 });
  }
}
