import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mapbox Search Box API — /retrieve. Resolves a suggestion's mapbox_id into the
// precise address + coordinates (rooftop accuracy, with a routable point ideal
// for courier navigation).
interface RoutablePoint {
  name: string;
  latitude: number;
  longitude: number;
}

interface RetrieveProperties {
  name: string;
  address?: string;
  full_address?: string;
  place_formatted?: string;
  coordinates?: { latitude: number; longitude: number; routable_points?: RoutablePoint[] };
  context?: {
    postcode?: { name: string };
    place?: { name: string };
    locality?: { name: string };
  };
}

interface RetrieveFeature {
  geometry: { coordinates: [number, number] };
  properties: RetrieveProperties;
}

function stripCountry(s: string | undefined): string {
  if (!s) return "";
  return s.replace(/,?\s*United Kingdom\s*$/i, "").trim();
}

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const id = params.get("id");
  const sessionToken = params.get("session_token");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Maps not configured" }, { status: 500 });
  }

  try {
    const url = new URL(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(id)}`
    );
    url.searchParams.set("access_token", token);
    if (sessionToken) url.searchParams.set("session_token", sessionToken);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Mapbox retrieve error ${res.status}`);

    const data: { features?: RetrieveFeature[] } = await res.json();
    const feature = data.features?.[0];
    if (!feature) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const p = feature.properties;
    // Prefer the routable point (built for navigation), then the rooftop
    // coordinate, then the feature geometry.
    const routable = p.coordinates?.routable_points?.[0];
    const lat = routable?.latitude ?? p.coordinates?.latitude ?? feature.geometry.coordinates[1];
    const lng = routable?.longitude ?? p.coordinates?.longitude ?? feature.geometry.coordinates[0];

    return NextResponse.json({
      result: {
        description: p.address || p.name || stripCountry(p.full_address),
        postcode: p.context?.postcode?.name ?? "",
        city: p.context?.locality?.name ?? p.context?.place?.name ?? "",
        geometry: { location: { lat, lng } },
      },
      status: "OK",
    });
  } catch (err) {
    console.error("Mapbox retrieve error:", err);
    return NextResponse.json({ error: "Retrieve failed" }, { status: 500 });
  }
}
