import { CHURCH_EVENT_TYPE_LABELS, type ChurchEvent } from '../types/church-event.types';
import {
  eventTimeSuggestResponseSchema,
  type EventTimeSuggestResponse,
} from '../schemas/event-time-suggest.schemas';
import type { PlanningHoliday } from './planning-holidays.utils';

export type EventTimeSuggestDraft = {
  title?: string;
  eventType?: string;
  location?: string;
  notes?: string;
  recurring?: string;
  ministryId?: string;
  ministryName?: string;
  /** Soft preference, e.g. "weekday evening" or "Saturday morning". */
  preference?: string;
};

export type EventTimeSuggestPromptContext = {
  draft: EventTimeSuggestDraft;
  calendarEvents: readonly ChurchEvent[];
  holidays: readonly PlanningHoliday[];
  fromIso: string;
  toIso: string;
};

function normalizeAiText(text: string): string {
  return text
    .replace(/^\uFEFF/, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

function tryParseJson(candidate: string): unknown | null {
  try {
    return JSON.parse(candidate) as unknown;
  } catch {
    return null;
  }
}

/** Pull balanced `{ ... }` slices starting at each `{`. */
function findJsonObjectCandidates(text: string): string[] {
  const candidates: string[] = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== '{') continue;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let j = i; j < text.length; j += 1) {
      const ch = text[j]!;
      if (inString) {
        if (escape) {
          escape = false;
        } else if (ch === '\\') {
          escape = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }
      if (ch === '"') {
        inString = true;
        continue;
      }
      if (ch === '{') depth += 1;
      if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          candidates.push(text.slice(i, j + 1));
          break;
        }
      }
    }
  }
  return candidates;
}

/**
 * Extract a JSON object from raw model text (plain, fenced, or buried in prose).
 */
export function extractJsonObject(text: string): unknown {
  const trimmed = normalizeAiText(text);
  if (!trimmed) {
    throw new Error('AI response did not include a JSON object.');
  }

  const fenceBlocks = [...trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map(
    (match) => match[1]?.trim() ?? '',
  );
  const sources = [...fenceBlocks, trimmed].filter(Boolean);

  for (const source of sources) {
    const direct = tryParseJson(source);
    if (direct && typeof direct === 'object') return direct;

    for (const candidate of findJsonObjectCandidates(source)) {
      const parsed = tryParseJson(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  }

  throw new Error('AI response did not include a JSON object.');
}

function filterSuggestions(
  suggestions: EventTimeSuggestResponse['suggestions'],
  fromIso: string,
  toIso: string,
): EventTimeSuggestResponse['suggestions'] {
  return suggestions.filter((item) => {
    if (item.eventDate < fromIso || item.eventDate > toIso) return false;
    if (item.startTime && item.endTime && item.endTime <= item.startTime) {
      return false;
    }
    return true;
  });
}

/** Last-resort scrape of YYYY-MM-DD (+ optional HH:MM) lines from prose. */
export function scrapeEventTimeSuggestionsFromProse(
  text: string,
  fromIso: string,
  toIso: string,
): EventTimeSuggestResponse | null {
  const suggestions: EventTimeSuggestResponse['suggestions'] = [];
  const seen = new Set<string>();
  const lineRegex =
    /(\d{4}-\d{2}-\d{2})(?:[^\d]{0,20}(\d{1,2}:\d{2})(?:\s*[–\-]\s*(\d{1,2}:\d{2}))?)?/g;

  for (const match of normalizeAiText(text).matchAll(lineRegex)) {
    const eventDate = match[1]!;
    if (eventDate < fromIso || eventDate > toIso) continue;
    const startRaw = match[2];
    const endRaw = match[3];
    const startTime = startRaw ? startRaw.padStart(5, '0') : undefined;
    const endTime = endRaw ? endRaw.padStart(5, '0') : undefined;
    const key = `${eventDate}|${startTime ?? ''}|${endTime ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({
      eventDate,
      startTime,
      endTime,
      reason: 'Parsed from AI recommendation text.',
    });
    if (suggestions.length >= 4) break;
  }

  const usable = filterSuggestions(suggestions, fromIso, toIso);
  if (usable.length === 0) return null;

  return {
    summary: 'Picked open slots from the AI recommendation text.',
    suggestions: usable,
  };
}

export function parseEventTimeSuggestResponse(
  text: string,
  fromIso: string,
  toIso: string,
): EventTimeSuggestResponse {
  try {
    const raw = extractJsonObject(text);
    const parsed = eventTimeSuggestResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? 'AI suggestion format was invalid.',
      );
    }

    const suggestions = filterSuggestions(
      parsed.data.suggestions.map((item) => ({
        eventDate: item.eventDate,
        startTime: item.startTime ?? undefined,
        endTime: item.endTime ?? undefined,
        reason: item.reason.trim(),
      })),
      fromIso,
      toIso,
    );

    if (suggestions.length === 0) {
      throw new Error('AI returned no usable date suggestions in the planning window.');
    }

    return {
      summary: parsed.data.summary.trim(),
      suggestions,
    };
  } catch (error) {
    const scraped = scrapeEventTimeSuggestionsFromProse(text, fromIso, toIso);
    if (scraped) return scraped;
    throw error;
  }
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function weekdayUtc(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

type SlotKind = 'evening' | 'morning' | 'afternoon';

function preferredSlotKinds(preference?: string): SlotKind[] {
  const text = preference?.toLowerCase() ?? '';
  if (text.includes('morning')) return ['morning', 'afternoon', 'evening'];
  if (text.includes('afternoon')) return ['afternoon', 'morning', 'evening'];
  if (text.includes('evening') || text.includes('night')) {
    return ['evening', 'afternoon', 'morning'];
  }
  return ['evening', 'morning', 'afternoon'];
}

function preferredWeekdays(preference?: string): number[] | null {
  const text = preference?.toLowerCase() ?? '';
  const days: number[] = [];
  if (text.includes('sunday')) days.push(0);
  if (text.includes('monday')) days.push(1);
  if (text.includes('tuesday')) days.push(2);
  if (text.includes('wednesday')) days.push(3);
  if (text.includes('thursday')) days.push(4);
  if (text.includes('friday')) days.push(5);
  if (text.includes('saturday')) days.push(6);
  if (text.includes('weekend')) days.push(0, 6);
  if (text.includes('weekday')) days.push(1, 2, 3, 4, 5);
  return days.length > 0 ? [...new Set(days)] : null;
}

function timesForSlot(kind: SlotKind): { startTime: string; endTime: string } {
  if (kind === 'morning') return { startTime: '10:00', endTime: '12:00' };
  if (kind === 'afternoon') return { startTime: '14:00', endTime: '16:00' };
  return { startTime: '18:00', endTime: '20:00' };
}

/**
 * Deterministic calendar/holiday-aware options when AI text is unusable.
 */
export function buildLocalEventTimeSuggestions(
  context: EventTimeSuggestPromptContext,
): EventTimeSuggestResponse {
  const { draft, calendarEvents, holidays, fromIso, toIso } = context;
  const busyDates = new Set(
    calendarEvents
      .filter((event) => event.status === 'scheduled' && event.eventDate)
      .map((event) => event.eventDate as string),
  );
  const holidayDates = new Set(holidays.map((holiday) => holiday.date));
  const slotKinds = preferredSlotKinds(draft.preference);
  const weekdays = preferredWeekdays(draft.preference);
  const suggestions: EventTimeSuggestResponse['suggestions'] = [];

  for (let offset = 1; offset <= 75 && suggestions.length < 3; offset += 1) {
    const eventDate = addDaysIso(fromIso, offset);
    if (eventDate > toIso) break;
    if (busyDates.has(eventDate) || holidayDates.has(eventDate)) continue;

    const day = weekdayUtc(eventDate);
    if (weekdays && !weekdays.includes(day)) continue;
    if (!weekdays && (day === 0 || day === 1)) continue; // skip Sun/Mon by default

    const kind = slotKinds[suggestions.length % slotKinds.length]!;
    const times = timesForSlot(kind);
    suggestions.push({
      eventDate,
      ...times,
      reason: busyDates.size
        ? 'Open on the staff calendar and clear of listed holidays.'
        : 'Clear of listed holidays in the planning window.',
    });
  }

  if (suggestions.length === 0) {
    const fallbackDate = addDaysIso(fromIso, 7);
    suggestions.push({
      eventDate: fallbackDate <= toIso ? fallbackDate : fromIso,
      startTime: '18:00',
      endTime: '20:00',
      reason: 'Fallback evening slot in the planning window.',
    });
  }

  return {
    summary:
      'AI did not return structured times, so these options were chosen from the church calendar and holiday list.',
    suggestions,
  };
}

function formatCalendarLine(event: ChurchEvent): string {
  const date = event.eventDate ?? 'DATE_TBD';
  const time =
    event.startTime && event.endTime
      ? `${event.startTime}–${event.endTime}`
      : event.startTime ?? 'time TBD';
  const scope = event.ministryName ?? (event.ministryId ? event.ministryId : 'church-wide');
  const title = event.title.trim() || '(untitled)';
  return `- ${date} ${time} · ${title} · ${CHURCH_EVENT_TYPE_LABELS[event.eventType]} · ${scope}`;
}

/** Build a Cursor ask-only prompt (calendar + holidays — no member PII). */
export function buildEventTimeSuggestPrompt(
  context: EventTimeSuggestPromptContext,
): string {
  const { draft, calendarEvents, holidays, fromIso, toIso } = context;
  const typeLabel = draft.eventType
    ? CHURCH_EVENT_TYPE_LABELS[
        draft.eventType as keyof typeof CHURCH_EVENT_TYPE_LABELS
      ] ?? draft.eventType
    : 'Other';

  const calendarLines = calendarEvents
    .filter((event) => event.status === 'scheduled')
    .slice(0, 80)
    .map(formatCalendarLine);

  const holidayLines = holidays.map((h) => `- ${h.date} · ${h.name}`);

  return [
    'CRITICAL OUTPUT RULES:',
    '- Reply with ONE JSON object only.',
    '- The first non-whitespace character MUST be { and the last MUST be }.',
    '- No markdown fences, no preamble, no bullet plan, no explanation outside JSON.',
    '',
    'Suggest 2–4 good date/time options for this Ebenezer Baptist Church staff calendar event.',
    `Planning window: ${fromIso} through ${toIso} (inclusive).`,
    'Avoid conflicts with existing calendar events on the same day/time when possible.',
    'Avoid major US holidays and high-conflict church dates listed below unless the event clearly belongs on that day (e.g. Christmas Eve service).',
    'Prefer times that fit typical church rhythms (evenings for weeknight ministry, mornings/afternoons for Saturday activities, Sundays only when appropriate for the type).',
    'Do not invent member names, phone numbers, emails, giving amounts, or other PII.',
    '',
    'Event draft:',
    `- title: ${draft.title?.trim() || '(untitled)'}`,
    `- type: ${typeLabel}`,
    `- ministry: ${draft.ministryName?.trim() || (draft.ministryId ? draft.ministryId : 'church-wide')}`,
    `- location: ${draft.location?.trim() || '(not set)'}`,
    `- recurring note: ${draft.recurring?.trim() || '(none)'}`,
    `- notes: ${draft.notes?.trim() || '(none)'}`,
    `- preference: ${draft.preference?.trim() || '(none)'}`,
    '',
    'Existing calendar events:',
    calendarLines.length > 0 ? calendarLines.join('\n') : '- (none in window)',
    '',
    'Holidays / high-conflict dates:',
    holidayLines.length > 0 ? holidayLines.join('\n') : '- (none in window)',
    '',
    'Required JSON shape:',
    '{"summary":"one short paragraph","suggestions":[{"eventDate":"YYYY-MM-DD","startTime":"HH:MM","endTime":"HH:MM","reason":"why this slot works"}]}',
    'startTime/endTime may be omitted if time-of-day does not matter. Use 24-hour HH:MM.',
  ].join('\n');
}
