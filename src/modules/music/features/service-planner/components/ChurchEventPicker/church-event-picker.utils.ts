import {
  CHURCH_EVENT_TYPE_LABELS,
  formatChurchEventDisplayTitle,
  type ChurchEvent,
  type ChurchEventType,
} from '@/modules/events/types/church-event.types';
import {
  effectiveEventType,
  filterEventsForMusicPlans,
} from '@/modules/events/utils/church-event-relevance.utils';

export type EventQuickFilter =
  | 'all'
  | 'upcoming-week'
  | 'upcoming-2-weeks'
  | 'upcoming-month'
  | ChurchEventType;

export type EventPickerPurpose = 'music-plan' | 'all';

export function formatEventPickerDate(isoDate: string): string {
  return new Date(`${isoDate.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatEventPickerTimeRange(
  start?: string,
  end?: string,
): string {
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return `Until ${end}`;
  return 'Time TBD';
}

export function eventSearchHaystack(event: ChurchEvent): string {
  const type = effectiveEventType(event);
  return [
    formatChurchEventDisplayTitle(event),
    event.title,
    event.eventDate,
    event.startTime,
    event.ministryName,
    event.location,
    event.recurring,
    CHURCH_EVENT_TYPE_LABELS[type],
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function filterChurchEventsForPicker(
  events: readonly ChurchEvent[],
  query: string,
  quickFilter: EventQuickFilter,
  fromIso: string = new Date().toISOString().slice(0, 10),
  purpose: EventPickerPurpose = 'all',
): ChurchEvent[] {
  const q = query.trim().toLowerCase();
  const from = fromIso.slice(0, 10);

  const weekEnd = addDaysIso(from, 7);
  const twoWeekEnd = addDaysIso(from, 14);
  const monthEnd = addDaysIso(from, 31);
  const scoped =
    purpose === 'music-plan' ? filterEventsForMusicPlans(events) : [...events];

  return scoped.filter((event) => {
    if (event.status !== 'scheduled') return false;
    if (!event.eventDate) return false;

    if (quickFilter === 'upcoming-week') {
      if (event.eventDate < from || event.eventDate > weekEnd) return false;
    } else if (quickFilter === 'upcoming-2-weeks') {
      if (event.eventDate < from || event.eventDate > twoWeekEnd) return false;
    } else if (quickFilter === 'upcoming-month') {
      if (event.eventDate < from || event.eventDate > monthEnd) return false;
    } else if (quickFilter !== 'all') {
      if (effectiveEventType(event) !== quickFilter) return false;
    }

    if (!q) return true;
    return eventSearchHaystack(event).includes(q);
  });
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
