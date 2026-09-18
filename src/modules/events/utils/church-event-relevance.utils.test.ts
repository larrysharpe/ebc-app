import { describe, expect, it } from 'vitest';

import type { ChurchEvent } from '@/modules/events/types/church-event.types';

import {
  effectiveEventType,
  filterEventsForMinistryCalendar,
  filterEventsForMusicPlans,
  isRelevantForMusicPlans,
} from './church-event-relevance.utils';

function event(
  partial: Partial<ChurchEvent> & Pick<ChurchEvent, 'id' | 'title'>,
): ChurchEvent {
  return {
    eventDate: '2026-08-02',
    eventType: 'other',
    status: 'scheduled',
    ...partial,
  };
}

describe('church-event-relevance', () => {
  it('treats Sunday School as education even if typed as worship', () => {
    expect(
      effectiveEventType({ title: 'Sunday School', eventType: 'worship' }),
    ).toBe('education');
    expect(
      isRelevantForMusicPlans(
        event({ id: 'ss', title: 'Sunday School', eventType: 'worship' }),
      ),
    ).toBe(false);
  });

  it('excludes midweek prayer from music plans', () => {
    expect(
      isRelevantForMusicPlans(
        event({
          id: 'prayer',
          title: 'Midweek Prayer & Bible Study',
          eventType: 'worship',
        }),
      ),
    ).toBe(false);
  });

  it('keeps morning worship and special services for music', () => {
    const events = [
      event({ id: 'w', title: 'Morning Worship', eventType: 'worship' }),
      event({ id: 'r', title: 'Summer Revival', eventType: 'special' }),
      event({ id: 'ss', title: 'Sunday School', eventType: 'worship' }),
      event({ id: 'c', title: 'COMMUNION SUNDAY', eventType: 'worship' }),
      event({
        id: 'youth',
        title: 'Youth meeting',
        eventType: 'meeting',
        ministryId: 'min-youth',
      }),
    ];
    expect(filterEventsForMusicPlans(events).map((row) => row.id)).toEqual([
      'w',
      'r',
    ]);
  });

  it('keeps ministry-owned education on that ministry only', () => {
    const events = [
      event({
        id: 'ss',
        title: 'Sunday School',
        eventType: 'education',
        ministryId: 'min-sunday-school',
      }),
      event({ id: 'w', title: 'Morning Worship', eventType: 'worship' }),
      event({
        id: 'youth',
        title: 'Youth Fellowship',
        eventType: 'meeting',
        ministryId: 'min-youth',
      }),
    ];
    expect(
      filterEventsForMinistryCalendar(events, 'min-sunday-school').map((row) => row.id),
    ).toEqual(['ss', 'w']);
    expect(
      filterEventsForMinistryCalendar(events, 'min-media').map((row) => row.id),
    ).toEqual(['w']);
  });
});
