import type { ActivityRequest } from './activity-request.types';

export type ChurchEventStatus =
  | 'draft'
  | 'pending_approval'
  | 'scheduled'
  | 'cancelled';

export type ChurchEventType =
  | 'worship'
  | 'education'
  | 'meeting'
  | 'outreach'
  | 'special'
  | 'other';

export type ChurchEvent = {
  id: string;
  title: string;
  /** ISO date YYYY-MM-DD; omitted when still planning. */
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  /** On-campus space id when a church room is selected; omitted for offsite. */
  spaceId?: string;
  notes?: string;
  /** Human-readable recurrence label (e.g. "1st & 3rd Fridays"). */
  recurring?: string;
  /** Structured recurrence pattern id. */
  recurrencePattern?: string;
  /** Shared across occurrences created together. */
  seriesId?: string;
  eventType: ChurchEventType;
  status: ChurchEventStatus;
  /** Digitized Activity Request fields. */
  activityRequest?: ActivityRequest;
  ministryId?: string;
  ministryName?: string;
};

export const CHURCH_EVENT_STATUS_LABELS: Record<ChurchEventStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  scheduled: 'Scheduled',
  cancelled: 'Cancelled',
};

export const CHURCH_EVENT_STATUSES = Object.keys(
  CHURCH_EVENT_STATUS_LABELS,
) as ChurchEventStatus[];

export const CHURCH_EVENT_TYPE_LABELS: Record<ChurchEventType, string> = {
  worship: 'Sunday worship',
  education: 'Class / Bible study',
  meeting: 'Meeting / prayer',
  outreach: 'Outreach',
  special: 'Special service',
  other: 'Other',
};

/** Types that belong on choir/music service plans. */
export const MUSIC_PLAN_EVENT_TYPES: readonly ChurchEventType[] = [
  'worship',
  'special',
] as const;

/**
 * Church-wide types that may appear on every ministry calendar
 * (not ministry-owned classes/meetings).
 */
export const CONGREGATION_WIDE_EVENT_TYPES: readonly ChurchEventType[] = [
  'worship',
  'special',
  'outreach',
] as const;

export const CHURCH_EVENT_TYPES = Object.keys(
  CHURCH_EVENT_TYPE_LABELS,
) as ChurchEventType[];

/** Title when set; otherwise a short date-based label (or Date TBD). */
export function formatChurchEventDisplayTitle(
  event: Pick<ChurchEvent, 'title' | 'eventDate'>,
): string {
  const title = event.title.trim();
  if (title) return title;
  if (!event.eventDate) return 'Untitled event (date TBD)';
  return new Date(`${event.eventDate.slice(0, 10)}T12:00:00`).toLocaleDateString(
    'en-US',
    { weekday: 'long', month: 'short', day: 'numeric' },
  );
}
