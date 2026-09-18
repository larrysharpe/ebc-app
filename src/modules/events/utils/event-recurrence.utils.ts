import {
  EVENT_RECURRENCE_HORIZON_DAYS,
  EVENT_RECURRENCE_PATTERNS,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT_LABELS,
  type EventRecurrencePattern,
} from '../constants/event-recurrence.constants';

export type ExpandRecurrenceInput = {
  startDate: string;
  pattern: EventRecurrencePattern;
  /** Inclusive end date (YYYY-MM-DD). Defaults to start + horizon. */
  untilDate?: string;
  /** For `custom`: weekdays 0=Sun … 6=Sat. */
  weekdays?: readonly number[];
  /** For `custom`: repeat every N weeks (default 1). */
  intervalWeeks?: number;
};

function parseIsoDate(iso: string): Date | null {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  date.setDate(date.getDate() + days);
  return toIso(date);
}

function weekdayOccurrenceInMonth(iso: string): number {
  const date = parseIsoDate(iso);
  if (!date) return 0;
  return Math.ceil(date.getDate() / 7);
}

function normalizeWeekdays(weekdays: readonly number[] | undefined): number[] {
  if (!weekdays?.length) return [];
  return [...new Set(weekdays.filter((day) => day >= 0 && day <= 6))].sort(
    (a, b) => a - b,
  );
}

function weeksBetween(start: Date, date: Date): number {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(Math.round((dateUtc - startUtc) / 86_400_000) / 7);
}

export function isEventRecurrencePattern(
  value: string,
): value is EventRecurrencePattern {
  return (EVENT_RECURRENCE_PATTERNS as readonly string[]).includes(value);
}

/** Human label stored on each occurrence (and shown in the list). */
export function formatRecurrenceLabel(
  pattern: EventRecurrencePattern,
  startDate: string,
  options?: {
    weekdays?: readonly number[];
    intervalWeeks?: number;
  },
): string | undefined {
  if (pattern === 'none') return undefined;
  const date = parseIsoDate(startDate);
  if (!date) return undefined;
  const weekday = WEEKDAY_NAMES[date.getDay()];
  const nth = weekdayOccurrenceInMonth(startDate);

  switch (pattern) {
    case 'weekly':
      return `Weekly on ${weekday}s`;
    case 'biweekly':
      return `Every 2 weeks on ${weekday}s`;
    case 'monthly_nth_weekday': {
      const suffix =
        nth === 1 ? 'st' : nth === 2 ? 'nd' : nth === 3 ? 'rd' : 'th';
      return `Monthly (${nth}${suffix} ${weekday})`;
    }
    case 'first_and_third':
      return `1st & 3rd ${weekday}s`;
    case 'second_and_fourth':
      return `2nd & 4th ${weekday}s`;
    case 'custom': {
      const days = normalizeWeekdays(options?.weekdays);
      const dayLabels =
        days.length > 0
          ? days.map((day) => WEEKDAY_SHORT_LABELS[day]).join(', ')
          : weekday.slice(0, 3);
      const interval = Math.max(1, options?.intervalWeeks ?? 1);
      return interval === 1
        ? `Custom · ${dayLabels}`
        : `Custom · every ${interval} weeks · ${dayLabels}`;
    }
    default:
      return undefined;
  }
}

function matchesPattern(
  iso: string,
  pattern: EventRecurrencePattern,
  startDate: string,
  options?: {
    weekdays?: readonly number[];
    intervalWeeks?: number;
  },
): boolean {
  const date = parseIsoDate(iso);
  const start = parseIsoDate(startDate);
  if (!date || !start) return false;

  const nth = weekdayOccurrenceInMonth(iso);

  switch (pattern) {
    case 'weekly':
      return date.getDay() === start.getDay();
    case 'biweekly': {
      if (date.getDay() !== start.getDay()) return false;
      const startUtc = Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );
      const dateUtc = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const diffDays = Math.round((dateUtc - startUtc) / 86_400_000);
      return diffDays % 14 === 0;
    }
    case 'monthly_nth_weekday':
      return (
        date.getDay() === start.getDay() &&
        nth === weekdayOccurrenceInMonth(startDate)
      );
    case 'first_and_third':
      return (
        date.getDay() === start.getDay() && (nth === 1 || nth === 3)
      );
    case 'second_and_fourth':
      return (
        date.getDay() === start.getDay() && (nth === 2 || nth === 4)
      );
    case 'custom': {
      const days = normalizeWeekdays(options?.weekdays);
      const allowed =
        days.length > 0 ? days : [start.getDay()];
      if (!allowed.includes(date.getDay())) return false;
      const interval = Math.max(1, options?.intervalWeeks ?? 1);
      if (interval === 1) return true;
      return weeksBetween(start, date) % interval === 0;
    }
    default:
      return false;
  }
}

/**
 * Expand a structured recurrence into occurrence dates (includes startDate).
 */
export function expandRecurrenceDates(input: ExpandRecurrenceInput): string[] {
  const startDate = input.startDate.slice(0, 10);
  if (!parseIsoDate(startDate)) return [];
  if (input.pattern === 'none') return [startDate];

  const untilDate = (
    input.untilDate?.slice(0, 10) ||
    addDays(startDate, EVENT_RECURRENCE_HORIZON_DAYS)
  );

  if (untilDate < startDate) return [startDate];

  const options = {
    weekdays: input.weekdays,
    intervalWeeks: input.intervalWeeks,
  };

  const dates: string[] = [];
  for (
    let cursor = startDate;
    cursor <= untilDate;
    cursor = addDays(cursor, 1)
  ) {
    if (matchesPattern(cursor, input.pattern, startDate, options)) {
      dates.push(cursor);
    }
  }

  return dates;
}
