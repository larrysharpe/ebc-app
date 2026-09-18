import { CHURCH } from '@/lib/church/church-config';

import type { PlaceSearchResult } from '@/modules/events/types/place-search.types';

/** Approximate campus coords for local bias (Telegraph Rd, Woodbridge VA). */
export const PLACE_SEARCH_BIAS = {
  lat: 38.6582,
  lon: -77.2965,
  /** Soft preference radius in km for ranking. */
  locationLabel: CHURCH.location,
} as const;

type PhotonFeature = {
  properties?: {
    osm_id?: number | string;
    osm_type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
    type?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

function buildSecondary(props: NonNullable<PhotonFeature['properties']>): string | undefined {
  const locality = props.city || props.town || props.village;
  const street = [props.housenumber, props.street].filter(Boolean).join(' ');
  const parts = [street, locality, props.state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

function buildLabel(
  name: string,
  props: NonNullable<PhotonFeature['properties']>,
): string {
  const secondary = buildSecondary(props);
  if (!secondary) return name;
  if (secondary.toLowerCase().includes(name.toLowerCase())) return secondary;
  return `${name} · ${secondary}`;
}

export function mapPhotonFeature(feature: PhotonFeature, index: number): PlaceSearchResult | null {
  const props = feature.properties ?? {};
  const name =
    props.name?.trim() ||
    [props.housenumber, props.street].filter(Boolean).join(' ').trim();
  if (!name) return null;

  const osmKey = [props.osm_type, props.osm_id].filter(Boolean).join('-');
  const coords = feature.geometry?.coordinates;
  const lon = coords?.[0];
  const lat = coords?.[1];

  return {
    id: osmKey || `place-${index}`,
    name,
    label: buildLabel(name, props),
    secondary: buildSecondary(props),
    lat,
    lon,
  };
}

/**
 * Search places / addresses via Photon (Komoot) — free typeahead, no API key.
 * Biased toward the church campus so “Popeyes” finds nearby results first.
 */
export async function searchPlaces(
  query: string,
  options?: { limit?: number; signal?: AbortSignal },
): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const limit = options?.limit ?? 6;
  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
    lat: String(PLACE_SEARCH_BIAS.lat),
    lon: String(PLACE_SEARCH_BIAS.lon),
    lang: 'en',
  });

  const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
    signal: options?.signal,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'EBC-APP/1.0 (church calendar; https://ebenezerbc.org)',
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error('Place search is temporarily unavailable.');
  }

  const data = (await response.json()) as PhotonResponse;
  const results: PlaceSearchResult[] = [];
  for (const [index, feature] of (data.features ?? []).entries()) {
    const mapped = mapPhotonFeature(feature, index);
    if (mapped) results.push(mapped);
  }
  return results;
}
