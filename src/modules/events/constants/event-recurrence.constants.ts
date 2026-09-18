export const EVENT_RECURRENCE_PATTERNS = [
  'none',
  'weekly',
  'biweekly',
  'monthly_nth_weekday',
  'first_and_third',
  'second_and_fourth',
  'custom',
] as const;

export type EventRecurrencePattern = (typeof EVENT_RECURRENCE_PATTERNS)[number];

export const EVENT_RECURRENCE_PATTERN_LABELS: Record<
  EventRecurrencePattern,
  string
> = {
  none: 'Does not repeat',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly_nth_weekday: 'Monthly (same week of month)',
  first_and_third: '1st & 3rd (this weekday)',
  second_and_fourth: '2nd & 4th (this weekday)',
  custom: 'Custom…',
};

/** How far ahead to create dated occurrences when a pattern is set. */
export const EVENT_RECURRENCE_HORIZON_DAYS = 90;

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const WEEKDAY_SHORT_LABELS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

export const CUSTOM_INTERVAL_WEEKS_OPTIONS = [1, 2, 3, 4] as const;
