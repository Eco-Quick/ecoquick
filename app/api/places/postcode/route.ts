import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PostcodesIoResult {
  status: number;
  result: {
    postcode: string;
    latitude: number;
    longitude: number;
    admin_district: string;
    parish: string;
    admin_ward: string;
    region: string;
  } | null;
}

interface NearbyPostcode {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string;
  admin_ward: string;
}

export async function GET(request: NextRequest) {
  const postcode = new URL(request.url).searchParams.get("postcode");

  if (!postcode || postcode.trim().length < 5) {
    return NextResponse.json({ predictions: [] });
  }

  const cleaned = postcode.trim().replace(/\s+/g, "");

  try {
    // Fetch the postcode details + nearby postcodes in parallel
    const [mainRes, nearbyRes] = await Promise.all([
      fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`),
      fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}/nearest?limit=8`),
    ]);

    if (!mainRes.ok) {
      return NextResponse.json({ predictions: [], status: "NO_RESULTS" });
    }

    const mainData: PostcodesIoResult = await mainRes.json();
    if (!mainData.result) {
      return NextResponse.json({ predictions: [], status: "NO_RESULTS" });
    }

    const main = mainData.result;
    const predictions = [];

    // Main postcode as first result
    predictions.push({
      place_id: `postcodes_main_${main.postcode}`,
      description: `${main.admin_ward}, ${main.admin_district}, ${main.postcode}`,
      structured_formatting: {
        main_text: main.postcode,
        secondary_text: `${main.admin_ward}, ${main.admin_district}`,
      },
      geometry: { location: { lat: main.latitude, lng: main.longitude } },
      postcode: main.postcode,
      city: main.admin_district,
    });

    // Add nearby postcodes as additional options
    if (nearbyRes.ok) {
      const nearbyData: { result: NearbyPostcode[] | null } = await nearbyRes.json();
      if (nearbyData.result) {
        for (const np of nearbyData.result) {
          if (np.postcode === main.postcode) continue; // Skip duplicate
          predictions.push({
            place_id: `postcodes_nearby_${np.postcode}`,
            description: `${np.admin_ward}, ${np.admin_district}, ${np.postcode}`,
            structured_formatting: {
              main_text: np.postcode,
              secondary_text: `${np.admin_ward}, ${np.admin_district}`,
            },
            geometry: { location: { lat: np.latitude, lng: np.longitude } },
            postcode: np.postcode,
            city: np.admin_district,
          });
        }
      }
    }

    return NextResponse.json({ predictions, status: "OK" });
  } catch (err) {
    console.error("Postcode lookup error:", err);
    return NextResponse.json({ predictions: [] });
  }
}
