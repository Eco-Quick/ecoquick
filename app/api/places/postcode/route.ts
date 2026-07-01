import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Ordnance Survey Places API — postcode lookup. Returns every Royal Mail
// delivery-point address (DPA) at a postcode, each with precise coordinates.
// This is the "postcode → pick your house" path; free-text falls back to Mapbox.
interface DPA {
  UPRN: string;
  ADDRESS: string;
  ORGANISATION_NAME?: string;
  SUB_BUILDING_NAME?: string;
  BUILDING_NAME?: string;
  BUILDING_NUMBER?: string;
  THOROUGHFARE_NAME?: string;
  DEPENDENT_THOROUGHFARE_NAME?: string;
  POST_TOWN?: string;
  POSTCODE?: string;
  LAT?: number;
  LNG?: number;
  X_COORDINATE?: number; // longitude when output_srs=EPSG:4326
  Y_COORDINATE?: number; // latitude  when output_srs=EPSG:4326
}

function titleCase(s: string | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(\d+[a-z])\b/gi, (m) => m.toUpperCase()); // 12A, 3B
}

function buildLine1(d: DPA): string {
  const street = [d.BUILDING_NUMBER, titleCase(d.THOROUGHFARE_NAME)].filter(Boolean).join(" ");
  const parts = [
    titleCase(d.ORGANISATION_NAME),
    titleCase(d.SUB_BUILDING_NAME),
    titleCase(d.BUILDING_NAME),
    street,
    titleCase(d.DEPENDENT_THOROUGHFARE_NAME),
  ].filter(Boolean);
  // De-dupe in case BUILDING_NAME already equals the street portion.
  return parts.join(", ") || titleCase(d.ADDRESS);
}

export async function GET(request: NextRequest) {
  const postcode = new URL(request.url).searchParams.get("postcode");

  if (!postcode || postcode.trim().length < 5) {
    return NextResponse.json({ predictions: [] });
  }

  const key = process.env.OS_PLACES_API_KEY;
  if (!key) {
    // No OS key configured — let the client fall back to Mapbox.
    return NextResponse.json({ predictions: [], status: "NO_KEY" });
  }

  const cleaned = postcode.trim().toUpperCase();

  try {
    const url = new URL("https://api.os.uk/search/places/v1/postcode");
    url.searchParams.set("postcode", cleaned);
    url.searchParams.set("dataset", "DPA");
    url.searchParams.set("output_srs", "EPSG:4326");
    url.searchParams.set("maxresults", "100");
    url.searchParams.set("key", key);

    const res = await fetch(url.toString());
    if (!res.ok) {
      // 400/404 = postcode not found; anything else we just fall back.
      return NextResponse.json({ predictions: [], status: "NO_RESULTS" });
    }

    const data: { results?: Array<{ DPA?: DPA }> } = await res.json();
    const rows = (data.results ?? []).map((r) => r.DPA).filter((d): d is DPA => !!d);

    const predictions = rows.map((d) => {
      const line1 = buildLine1(d);
      const town = titleCase(d.POST_TOWN);
      const pc = d.POSTCODE ?? cleaned;
      const lat = d.LAT ?? d.Y_COORDINATE ?? null;
      const lng = d.LNG ?? d.X_COORDINATE ?? null;
      return {
        place_id: `os_${d.UPRN}`,
        description: line1,
        structured_formatting: {
          main_text: line1,
          secondary_text: [town, pc].filter(Boolean).join(", "),
        },
        postcode: pc,
        city: town,
        geometry:
          lat != null && lng != null ? { location: { lat, lng } } : undefined,
      };
    });

    // Sort by building number where possible so the list reads naturally.
    predictions.sort((a, b) => {
      const na = parseInt(a.description, 10);
      const nb = parseInt(b.description, 10);
      if (Number.isNaN(na) && Number.isNaN(nb)) return a.description.localeCompare(b.description);
      if (Number.isNaN(na)) return 1;
      if (Number.isNaN(nb)) return -1;
      return na - nb;
    });

    return NextResponse.json({ predictions, status: "OK" });
  } catch (err) {
    console.error("OS Places lookup error:", err);
    return NextResponse.json({ predictions: [] });
  }
}
