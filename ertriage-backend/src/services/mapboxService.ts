import { ClinicResult } from '../../../shared/types';

const MAPBOX_TOKEN = process.env.MAPBOX_SECRET_TOKEN || '';
const MAPBOX_BASE = 'https://api.mapbox.com';

export async function geocodePostalCode(postalCode: string): Promise<{ lat: number; lng: number }> {
  const response = await fetch(
    `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(postalCode)}.json?country=CA&access_token=${MAPBOX_TOKEN}`
  );

  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  const data = await response.json();
  const [lng, lat] = data.features[0].center;
  return { lat, lng };
}

export async function findNearbyClinics(lat: number, lng: number): Promise<ClinicResult[]> {
  const categories = ['urgent+care', 'hospital', 'clinic'];
  const results: ClinicResult[] = [];

  for (const category of categories) {
    const response = await fetch(
      `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${category}.json?proximity=${lng},${lat}&country=CA&limit=3&access_token=${MAPBOX_TOKEN}`
    );

    if (!response.ok) continue;

    const data = await response.json();
    for (const feature of data.features.slice(0, 1)) {
      results.push({
        name: feature.text,
        address: feature.place_name,
        distance: calculateDistance(lat, lng, feature.center[1], feature.center[0]),
        hours: 'Call for hours',
        type: category === 'hospital' ? 'er' : 'urgent_care',
      });
    }
  }

  return results.slice(0, 3);
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  return `${km.toFixed(1)} km`;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const coords = await geocodePostalCode('Kitchener, ON');
    return coords.lat !== 0 && coords.lng !== 0;
  } catch {
    console.warn('Mapbox health check failed');
    return false;
  }
}
