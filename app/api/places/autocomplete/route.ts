import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mapbox Search Box API — /suggest. Returns address-level suggestions; precise
// coordinates are fetched separately via /retrieve (see retrieve/route.ts).
interface SearchBoxContext {
  postcode?: { name: string };
  place?: { name: string };
  locality?: { name: string };
  region?: { name: string };
}

interface SearchBoxSuggestion {
  name: string;
  name_preferred?: string;
  mapbox_id: string;
  feature_type: string;
  address?: string;
  full_address?: string;
  place_formatted?: string;
  context?: SearchBoxContext;
}

// Bias results toward the Kingston-upon-Thames service area.
const PROXIMITY = "-0.3007,51.4123";

function stripCountry(s: string | undefined): string {
  if (!s) return "";
  return s.replace(/,?\s*United Kingdom\s*$/i, "").trim();
}

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const input = params.get("input");
  const sessionToken = params.get("session_token");

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    const url = new URL("https://api.mapbox.com/search/searchbox/v1/suggest");
    url.searchParams.set("q", input.trim());
    url.searchParams.set("access_token", token);
    if (sessionToken) url.searchParams.set("session_token", sessionToken);
    url.searchParams.set("country", "gb");
    url.searchParams.set("language", "en");
    url.searchParams.set("limit", "6");
    url.searchParams.set("proximity", PROXIMITY);
    // Address-level only — every selectable result has a house number, so saved
    // pickup/delivery points are precise. (Mapbox needs a number + street; a bare
    // postcode or street name alone returns nothing, hence the UX nudges.)
    url.searchParams.set("types", "address");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Mapbox suggest error ${res.status}`);

    const data: { suggestions?: SearchBoxSuggestion[] } = await res.json();

    const predictions = (data.suggestions ?? []).map((s) => {
      const mainText = s.name_preferred || s.name;
      const secondaryText = stripCountry(s.place_formatted);
      return {
        place_id: s.mapbox_id, // used to /retrieve precise coordinates on select
        description: stripCountry(s.full_address) || mainText,
        structured_formatting: { main_text: mainText, secondary_text: secondaryText },
        postcode: s.context?.postcode?.name ?? "",
        city: s.context?.place?.name ?? s.context?.locality?.name ?? "",
      };
    });

    return NextResponse.json({ predictions, status: "OK" });
  } catch (err) {
    console.error("Mapbox suggest error:", err);
    return NextResponse.json({ predictions: [] });
  }
}
