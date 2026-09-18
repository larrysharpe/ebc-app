import {
  CONGREGATION_WIDE_EVENT_TYPES,
  MUSIC_PLAN_EVENT_TYPES,
  type ChurchEvent,
  type ChurchEventType,
} from '@/modules/events/types/church-event.types';
import { isServiceCharacteristicMarkerTitle } from '@/modules/events/utils/sunday-service-characteristic.utils';

/** Title patterns for classes / midweek study — not Sunday worship for music. */
const EDUCATION_TITLE =
  /sunday\s*school|bible\s*study|vacation\s*bible|vbs|christian\s*education|discipleship\s*class|new\s*members?\s*class/i;

/** Midweek prayer / zoom prayer — not a choir service plan. */
const MIDWEEK_PRAYER_TITLE =
  /mid[- ]?week|wednesday\s*(night\s*)?prayer|prayer\s*(&|and)\s*bible|zoom\s*prayer|noon\s*prayer/i;

/** Clear Sunday / special worship cues. */
const WORSHIP_SERVICE_TITLE =
  /morning\s*worship|evening\s*worship|sunday\s*worship|worship\s*service|watch\s*night|revival|homecoming|anniversary\s*service/i;

export function looksLikeEducationEvent(
  event: Pick<ChurchEvent, 'title' | 'eventType'>,
): boolean {
  if (event.eventType === 'education') return true;
  return EDUCATION_TITLE.test(event.title);
}

export function looksLikeMidweekPrayerEvent(
  event: Pick<ChurchEvent, 'title' | 'eventType'>,
): boolean {
  return MIDWEEK_PRAYER_TITLE.test(event.title);
}

export function looksLikeWorshipService(
  event: Pick<ChurchEvent, 'title' | 'eventType'>,
): boolean {
  if (isServiceCharacteristicMarkerTitle(event.title)) return false;
  if (event.eventType === 'worship' && !looksLikeEducationEvent(event)) {
    return !looksLikeMidweekPrayerEvent(event);
  }
  if (event.eventType === 'special') return true;
  return WORSHIP_SERVICE_TITLE.test(event.title);
}

/**
 * Effective type for filtering when older imports mis-tagged Sunday School as worship.
 */
export function effectiveEventType(
  event: Pick<ChurchEvent, 'title' | 'eventType'>,
): ChurchEventType {
  if (looksLikeEducationEvent(event)) return 'education';
  if (
    looksLikeMidweekPrayerEvent(event) &&
    event.eventType !== 'worship' &&
    event.eventType !== 'special'
  ) {
    return event.eventType === 'other' ? 'meeting' : event.eventType;
  }
  if (looksLikeMidweekPrayerEvent(event) && event.eventType === 'worship') {
    return 'meeting';
  }
  return event.eventType;
}

/**
 * Events a choir director should pick when building a service plan.
 * Excludes classes, midweek prayer, and other ministries' meetings.
 */
export function isRelevantForMusicPlans(event: ChurchEvent): boolean {
  if (event.status !== 'scheduled') return false;
  if (!event.eventDate) return false;
  if (isServiceCharacteristicMarkerTitle(event.title)) return false;

  const type = effectiveEventType(event);
  if (looksLikeEducationEvent(event) || looksLikeMidweekPrayerEvent(event)) {
    return false;
  }

  // Ministry-owned events that aren't worship/special stay on that ministry.
  if (event.ministryId && !MUSIC_PLAN_EVENT_TYPES.includes(type)) {
    return false;
  }

  if (MUSIC_PLAN_EVENT_TYPES.includes(type)) return true;

  // Untyped / "other" church-wide with a clear worship title.
  if (!event.ministryId && looksLikeWorshipService(event)) return true;

  return false;
}

export function filterEventsForMusicPlans(
  events: readonly ChurchEvent[],
): ChurchEvent[] {
  return events.filter(isRelevantForMusicPlans);
}

/**
 * Church-wide rows allowed on a ministry calendar feed.
 * Ministry-owned rows for *this* ministry are included separately by the query.
 */
export function isCongregationWideForMinistryCalendars(event: ChurchEvent): boolean {
  if (event.ministryId) return false;
  if (event.status !== 'scheduled') return false;
  if (isServiceCharacteristicMarkerTitle(event.title)) return false;
  if (looksLikeEducationEvent(event) || looksLikeMidweekPrayerEvent(event)) {
    return false;
  }
  const type = effectiveEventType(event);
  return CONGREGATION_WIDE_EVENT_TYPES.includes(type);
}

/** Keep this ministry’s events + congregation-wide worship/special/outreach. */
export function filterEventsForMinistryCalendar(
  events: readonly ChurchEvent[],
  ministryId: string,
): ChurchEvent[] {
  return events.filter(
    (event) =>
      !isServiceCharacteristicMarkerTitle(event.title) &&
      (event.ministryId === ministryId ||
        isCongregationWideForMinistryCalendars(event)),
  );
}

/** Drop WP ordinance tags that should live on Sunday services instead. */
export function filterCalendarEvents(
  events: readonly ChurchEvent[],
): ChurchEvent[] {
  return events.filter(
    (event) => !isServiceCharacteristicMarkerTitle(event.title),
  );
}
