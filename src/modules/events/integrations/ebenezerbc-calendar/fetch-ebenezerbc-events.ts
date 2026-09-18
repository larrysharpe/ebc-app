import {
  EBENEZERBC_MEC_EVENTS_URL,
  ebenezerbcEventIcalUrl,
} from './ebenezerbc-calendar.constants';
import {
  buildSeedOccurrences,
  buildSeedServiceCharacteristicTags,
  decodeHtmlEntities,
  parseIcalEvent,
  type SeedOccurrence,
  type SeedServiceCharacteristicTag,
} from './ebenezerbc-calendar.utils';

type MecListItem = {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  content?: { rendered: string };
};

export type EbenezerbcSeedPayload = {
  occurrences: SeedOccurrence[];
  serviceTags: SeedServiceCharacteristicTag[];
};

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: 'text/calendar, application/json, */*' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

export async function fetchEbenezerbcSeedPayload(options?: {
  from?: Date;
  horizonDays?: number;
}): Promise<EbenezerbcSeedPayload> {
  const listRaw = await fetchText(EBENEZERBC_MEC_EVENTS_URL);
  const list = JSON.parse(listRaw) as MecListItem[];
  if (!Array.isArray(list)) {
    throw new Error('Unexpected MEC events response');
  }

  const occurrences: SeedOccurrence[] = [];
  const serviceTags: SeedServiceCharacteristicTag[] = [];

  for (const item of list) {
    const title = decodeHtmlEntities(item.title?.rendered ?? '');
    let icalText: string;
    try {
      icalText = await fetchText(ebenezerbcEventIcalUrl(item.id));
    } catch {
      continue;
    }

    const parsed = parseIcalEvent(icalText);
    if (!parsed) continue;
    if (!parsed.summary && title) parsed.summary = title;

    const sourceUrl = item.link || `https://ebenezerbc.org/events/${item.slug}`;
    occurrences.push(
      ...buildSeedOccurrences(item.id, parsed, sourceUrl, options),
    );
    serviceTags.push(
      ...buildSeedServiceCharacteristicTags(item.id, parsed, sourceUrl, options),
    );
  }

  const byId = new Map<string, SeedOccurrence>();
  for (const occurrence of occurrences) {
    byId.set(occurrence.id, occurrence);
  }

  const byFingerprint = new Map<string, SeedOccurrence>();
  for (const occurrence of byId.values()) {
    const key = [
      occurrence.title.toLowerCase(),
      occurrence.eventDate,
      occurrence.startTime ?? '',
    ].join('|');
    const existing = byFingerprint.get(key);
    if (!existing || occurrence.mecId > existing.mecId) {
      byFingerprint.set(key, occurrence);
    }
  }

  const tagsByDate = new Map<string, SeedServiceCharacteristicTag>();
  for (const tag of serviceTags) {
    const key = tag.serviceDate;
    const existing = tagsByDate.get(key);
    if (!existing) {
      tagsByDate.set(key, tag);
      continue;
    }
    tagsByDate.set(key, {
      ...existing,
      characteristics: [
        ...new Set([...existing.characteristics, ...tag.characteristics]),
      ],
      sourceTitle: `${existing.sourceTitle}; ${tag.sourceTitle}`,
    });
  }

  return {
    occurrences: [...byFingerprint.values()].sort((a, b) =>
      a.eventDate.localeCompare(b.eventDate),
    ),
    serviceTags: [...tagsByDate.values()].sort((a, b) =>
      a.serviceDate.localeCompare(b.serviceDate),
    ),
  };
}

/** @deprecated Prefer fetchEbenezerbcSeedPayload — kept for callers that only need events. */
export async function fetchEbenezerbcSeedOccurrences(options?: {
  from?: Date;
  horizonDays?: number;
}): Promise<SeedOccurrence[]> {
  const payload = await fetchEbenezerbcSeedPayload(options);
  return payload.occurrences;
}
