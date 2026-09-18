import type { ChurchEventType } from '../../types/church-event.types';
import type { ServiceCharacteristic } from '../../types/sunday-service.types';
import {
  inferServiceCharacteristicsFromTitle,
  isServiceCharacteristicMarkerTitle,
} from '../../utils/sunday-service-characteristic.utils';
import { MINISTRY_TITLE_RULES, SEED_HORIZON_DAYS } from './ebenezerbc-calendar.constants';

export type ParsedIcalEvent = {
  summary: string;
  description?: string;
  location?: string;
  url?: string;
  dtStart: Date;
  dtEnd?: Date;
  rrule?: string;
};

export type SeedOccurrence = {
  /** Stable id: wp-{mecId}-{YYYYMMDD} */
  id: string;
  mecId: number;
  title: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  recurring?: string;
  eventType: ChurchEventType;
  ministryId?: string;
  sourceUrl?: string;
};

/** Ordinance / emphasis tags from WP that belong on SundayService, not ChurchEvent. */
export type SeedServiceCharacteristicTag = {
  mecId: number;
  serviceDate: string;
  characteristics: ServiceCharacteristic[];
  sourceTitle: string;
  notes?: string;
  sourceUrl?: string;
};

const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function matchMinistryId(title: string): string | undefined {
  for (const rule of MINISTRY_TITLE_RULES) {
    if (rule.pattern.test(title)) return rule.ministryId;
  }
  return undefined;
}

export function inferEventType(title: string): ChurchEventType {
  if (
    /sunday\s*school|bible\s*study|vacation\s*bible|\bvbs\b|christian\s*education/i.test(
      title,
    )
  ) {
    return 'education';
  }
  if (
    /mid[- ]?week|wednesday\s*(night\s*)?prayer|prayer\s*(&|and)\s*bible|zoom\s*prayer/i.test(
      title,
    )
  ) {
    return 'meeting';
  }
  if (/worship/i.test(title)) {
    return 'worship';
  }
  if (/pantry|nursing|outreach|mission/i.test(title)) return 'outreach';
  if (/meeting|orientation|ministry/i.test(title)) return 'meeting';
  if (/special|friendsgiving|heritage|revival|homecoming/i.test(title)) {
    return 'special';
  }
  return 'other';
}

export function formatRecurringLabel(rrule: string | undefined): string | undefined {
  if (!rrule) return undefined;
  if (/FREQ=WEEKLY/i.test(rrule)) return 'Weekly';
  if (/FREQ=YEARLY/i.test(rrule)) return 'Yearly';
  const byDay = rrule.match(/BYDAY=([^;]+)/i)?.[1];
  if (/FREQ=MONTHLY/i.test(rrule) && byDay) {
    const token = byDay.split(',')[0] ?? byDay;
    const nth = token.match(/(-?\d+)/)?.[1];
    const day = token.match(/([A-Z]{2})$/i)?.[1]?.toUpperCase();
    const dayNames: Record<string, string> = {
      SU: 'Sunday',
      MO: 'Monday',
      TU: 'Tuesday',
      WE: 'Wednesday',
      TH: 'Thursday',
      FR: 'Friday',
      SA: 'Saturday',
    };
    if (nth && day && dayNames[day]) {
      const ordinal =
        nth === '1'
          ? '1st'
          : nth === '2'
            ? '2nd'
            : nth === '3'
              ? '3rd'
              : nth === '4'
                ? '4th'
                : nth === '-1'
                  ? 'Last'
                  : `${nth}th`;
      return `${ordinal} ${dayNames[day]} monthly`;
    }
    return 'Monthly';
  }
  if (/FREQ=MONTHLY/i.test(rrule)) return 'Monthly';
  return 'Recurring';
}

function unfoldIcal(raw: string): string {
  return raw.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
}

function parseIcalDate(value: string): Date | null {
  const compact = value.trim();
  // YYYYMMDD
  if (/^\d{8}$/.test(compact)) {
    const y = Number(compact.slice(0, 4));
    const m = Number(compact.slice(4, 6)) - 1;
    const d = Number(compact.slice(6, 8));
    return new Date(Date.UTC(y, m, d, 12, 0, 0));
  }
  // YYYYMMDDTHHMMSSZ or without Z
  const match = compact.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/,
  );
  if (!match) return null;
  const [, ys, ms, ds, hs, mins, ss, z] = match;
  if (z) {
    return new Date(
      Date.UTC(
        Number(ys),
        Number(ms) - 1,
        Number(ds),
        Number(hs),
        Number(mins),
        Number(ss),
      ),
    );
  }
  // Floating local — treat as Eastern (church locale).
  return new Date(
    `${ys}-${ms}-${ds}T${hs}:${mins}:${ss}-04:00`,
  );
}

function rruleUntilDate(rrule: string): Date | null {
  const until = rrule.match(/UNTIL=([0-9T]+Z?)/i)?.[1];
  if (!until) return null;
  return parseIcalDate(until);
}

export function parseIcalEvent(icalText: string): ParsedIcalEvent | null {
  const text = unfoldIcal(icalText);
  const block = text.match(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/);
  if (!block) return null;
  const body = block[1] ?? '';

  const field = (name: string): string | undefined => {
    const re = new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, 'im');
    const match = body.match(re);
    return match?.[1]?.replace(/\\n/g, '\n').replace(/\\,/g, ',').trim();
  };

  const dtStartRaw = field('DTSTART');
  if (!dtStartRaw) return null;
  const dtStart = parseIcalDate(dtStartRaw);
  if (!dtStart) return null;

  const dtEndRaw = field('DTEND');
  const dtEnd = dtEndRaw ? parseIcalDate(dtEndRaw) ?? undefined : undefined;
  const summary = decodeHtmlEntities(field('SUMMARY') ?? 'Untitled event');

  return {
    summary,
    description: field('DESCRIPTION')
      ? decodeHtmlEntities(field('DESCRIPTION')!)
      : undefined,
    location: field('LOCATION')
      ? decodeHtmlEntities(field('LOCATION')!)
      : undefined,
    url: field('URL'),
    dtStart,
    dtEnd: dtEnd ?? undefined,
    rrule: field('RRULE'),
  };
}

function toEasternParts(date: Date): {
  eventDate: string;
  startTime: string;
} {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value]),
  );
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return {
    eventDate: `${parts.year}-${parts.month}-${parts.day}`,
    startTime: `${hour}:${parts.minute}`,
  };
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function nthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  nth: number,
): Date | null {
  if (nth > 0) {
    const first = new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
    const firstDow = first.getUTCDay();
    const delta = (weekday - firstDow + 7) % 7;
    const day = 1 + delta + (nth - 1) * 7;
    const candidate = new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));
    if (candidate.getUTCMonth() !== monthIndex) return null;
    return candidate;
  }
  // last weekday
  const last = new Date(Date.UTC(year, monthIndex + 1, 0, 12, 0, 0));
  const lastDow = last.getUTCDay();
  const delta = (lastDow - weekday + 7) % 7;
  return new Date(Date.UTC(year, monthIndex, last.getUTCDate() - delta, 12, 0, 0));
}

function applyTimeFromTemplate(day: Date, template: Date): Date {
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      template.getUTCHours(),
      template.getUTCMinutes(),
      template.getUTCSeconds(),
    ),
  );
}

/** Expand a single MEC event into concrete occurrences in [from, to]. */
export function expandOccurrences(
  parsed: ParsedIcalEvent,
  from: Date,
  to: Date,
): { start: Date; end?: Date }[] {
  const durationMs =
    parsed.dtEnd && parsed.dtEnd > parsed.dtStart
      ? parsed.dtEnd.getTime() - parsed.dtStart.getTime()
      : 60 * 60 * 1000;

  const until = parsed.rrule ? rruleUntilDate(parsed.rrule) : null;
  if (until && until < from) return [];

  const rangeEnd = until && until < to ? until : to;

  if (!parsed.rrule) {
    if (parsed.dtStart < from || parsed.dtStart > rangeEnd) return [];
    return [{ start: parsed.dtStart, end: parsed.dtEnd }];
  }

  const results: { start: Date; end?: Date }[] = [];
  const push = (start: Date) => {
    if (start < from || start > rangeEnd) return;
    results.push({
      start,
      end: new Date(start.getTime() + durationMs),
    });
  };

  if (/FREQ=WEEKLY/i.test(parsed.rrule)) {
    let cursor = parsed.dtStart;
    // Fast-forward near window
    while (cursor < from) {
      cursor = addDays(cursor, 7);
    }
    while (cursor <= rangeEnd) {
      push(cursor);
      cursor = addDays(cursor, 7);
    }
    return results;
  }

  if (/FREQ=MONTHLY/i.test(parsed.rrule)) {
    const byDay = parsed.rrule.match(/BYDAY=([^;]+)/i)?.[1];
    const token = byDay?.split(',')[0];
    const nth = Number(token?.match(/(-?\d+)/)?.[1] ?? '0');
    const dayCode = token?.match(/([A-Z]{2})$/i)?.[1]?.toUpperCase();
    const weekday = dayCode ? WEEKDAY_CODES.indexOf(dayCode as (typeof WEEKDAY_CODES)[number]) : -1;

    if (nth !== 0 && weekday >= 0) {
      let year = from.getUTCFullYear();
      let month = from.getUTCMonth();
      for (let i = 0; i < 24; i += 1) {
        const day = nthWeekdayOfMonth(year, month, weekday, nth);
        if (day) {
          const start = applyTimeFromTemplate(day, parsed.dtStart);
          push(start);
        }
        month += 1;
        if (month > 11) {
          month = 0;
          year += 1;
        }
      }
      return results;
    }

    // Same day-of-month fallback
    let cursor = parsed.dtStart;
    while (cursor < from) {
      cursor = new Date(
        Date.UTC(
          cursor.getUTCFullYear(),
          cursor.getUTCMonth() + 1,
          cursor.getUTCDate(),
          cursor.getUTCHours(),
          cursor.getUTCMinutes(),
          cursor.getUTCSeconds(),
        ),
      );
    }
    while (cursor <= rangeEnd) {
      push(cursor);
      cursor = new Date(
        Date.UTC(
          cursor.getUTCFullYear(),
          cursor.getUTCMonth() + 1,
          cursor.getUTCDate(),
          cursor.getUTCHours(),
          cursor.getUTCMinutes(),
          cursor.getUTCSeconds(),
        ),
      );
    }
    return results;
  }

  if (/FREQ=YEARLY/i.test(parsed.rrule)) {
    let cursor = parsed.dtStart;
    while (cursor < from) {
      cursor = new Date(
        Date.UTC(
          cursor.getUTCFullYear() + 1,
          cursor.getUTCMonth(),
          cursor.getUTCDate(),
          cursor.getUTCHours(),
          cursor.getUTCMinutes(),
          cursor.getUTCSeconds(),
        ),
      );
    }
    while (cursor <= rangeEnd) {
      push(cursor);
      cursor = new Date(
        Date.UTC(
          cursor.getUTCFullYear() + 1,
          cursor.getUTCMonth(),
          cursor.getUTCDate(),
          cursor.getUTCHours(),
          cursor.getUTCMinutes(),
          cursor.getUTCSeconds(),
        ),
      );
    }
    return results;
  }

  // Unknown RRULE — include DTSTART if in range
  if (parsed.dtStart >= from && parsed.dtStart <= rangeEnd) {
    return [{ start: parsed.dtStart, end: parsed.dtEnd }];
  }
  return [];
}

export function buildSeedOccurrences(
  mecId: number,
  parsed: ParsedIcalEvent,
  sourceUrl: string,
  options?: { from?: Date; horizonDays?: number },
): SeedOccurrence[] {
  // Communion / baptism / baby dedication “Sunday” rows are service tags.
  if (isServiceCharacteristicMarkerTitle(parsed.summary)) {
    return [];
  }

  const from = options?.from ?? new Date();
  from.setHours(0, 0, 0, 0);
  const horizonDays = options?.horizonDays ?? SEED_HORIZON_DAYS;
  const to = addDays(from, horizonDays);

  const ministryId = matchMinistryId(parsed.summary);
  const eventType = inferEventType(parsed.summary);
  const recurring = formatRecurringLabel(parsed.rrule);
  const noteParts = [
    parsed.description?.slice(0, 500),
    `Imported from ebenezerbc.org (MEC #${mecId})`,
    sourceUrl,
  ].filter(Boolean);

  return expandOccurrences(parsed, from, to).map((occurrence) => {
    const startParts = toEasternParts(occurrence.start);
    const endParts = occurrence.end ? toEasternParts(occurrence.end) : null;
    const dateKey = startParts.eventDate.replace(/-/g, '');
    return {
      id: `wp-${mecId}-${dateKey}`,
      mecId,
      title: parsed.summary,
      eventDate: startParts.eventDate,
      startTime: startParts.startTime,
      endTime:
        endParts && endParts.eventDate === startParts.eventDate
          ? endParts.startTime
          : undefined,
      location: parsed.location,
      notes: noteParts.join('\n'),
      recurring,
      eventType,
      ministryId,
      sourceUrl,
    };
  });
}

export function buildSeedServiceCharacteristicTags(
  mecId: number,
  parsed: ParsedIcalEvent,
  sourceUrl: string,
  options?: { from?: Date; horizonDays?: number },
): SeedServiceCharacteristicTag[] {
  if (!isServiceCharacteristicMarkerTitle(parsed.summary)) return [];
  const characteristics = inferServiceCharacteristicsFromTitle(parsed.summary);
  if (characteristics.length === 0) return [];

  const from = options?.from ?? new Date();
  from.setHours(0, 0, 0, 0);
  const horizonDays = options?.horizonDays ?? SEED_HORIZON_DAYS;
  const to = addDays(from, horizonDays);
  const noteParts = [
    `Imported from ebenezerbc.org (MEC #${mecId}) as a Sunday service tag`,
    sourceUrl,
  ];

  return expandOccurrences(parsed, from, to).map((occurrence) => {
    const startParts = toEasternParts(occurrence.start);
    return {
      mecId,
      serviceDate: startParts.eventDate,
      characteristics,
      sourceTitle: parsed.summary,
      notes: noteParts.join('\n'),
      sourceUrl,
    };
  });
}

export function defaultSeedWindow(): { from: Date; to: Date } {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  return { from, to: addDays(from, SEED_HORIZON_DAYS) };
}
