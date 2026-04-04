import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
  properties: { address?: string };
  context?: Array<{ id: string; text: string; short_code?: string }>;
}

export async function GET(request: NextRequest) {
  const input = new URL(request.url).searchParams.get("input");

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input.trim())}.json`
    );
    url.searchParams.set("access_token", token);
    url.searchParams.set("country", "gb");
    url.searchParams.set("limit", "5");
    url.searchParams.set("types", "address,postcode,locality,place,neighborhood");
    url.searchParams.set("autocomplete", "true");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Mapbox error ${res.status}`);

    const data: { features: MapboxFeature[] } = await res.json();

    const predictions = data.features.map((f) => {
      const mainText = f.properties?.address
        ? `${f.properties.address} ${f.text}`
        : f.text;

      const contextParts: string[] = [];
      f.context?.forEach((c) => {
        if (
          c.id.startsWith("locality") ||
          c.id.startsWith("place") ||
          c.id.startsWith("postcode") ||
          c.id.startsWith("region")
        ) {
          contextParts.push(c.text);
        }
      });

      const secondaryText =
        contextParts.length > 0
          ? contextParts.join(", ")
          : f.place_name.split(",").slice(1).join(",").trim();

      // Extract postcode from context
      const postcodeCtx = f.context?.find((c) => c.id.startsWith("postcode"));
      const postcode = postcodeCtx?.text ?? extractPostcode(f.place_name);

      // Extract city from context (first locality or place)
      const cityCtx = f.context?.find(
        (c) => c.id.startsWith("locality") || c.id.startsWith("place")
      );
      const city = cityCtx?.text ?? "";

      return {
        place_id: `mapbox_${f.id}`,
        description: f.place_name,
        structured_formatting: { main_text: mainText, secondary_text: secondaryText },
        geometry: { location: { lat: f.center[1], lng: f.center[0] } },
        postcode,
        city,
      };
    });

    return NextResponse.json({ predictions, status: "OK" });
  } catch (err) {
    console.error("Mapbox autocomplete error:", err);
    return NextResponse.json({ predictions: [] });
  }
}

function extractPostcode(address: string): string {
  const match = address.match(/([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})/i);
  return match ? match[1].toUpperCase() : "";
}
