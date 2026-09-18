import { describe, expect, it } from 'vitest';

import type { ChurchEvent } from '@/modules/events/types/church-event.types';

import { filterChurchEventsForPicker } from './church-event-picker.utils';

function event(partial: Partial<ChurchEvent> & Pick<ChurchEvent, 'id' | 'eventDate'>): ChurchEvent {
  return {
    title: partial.title ?? 'Event',
    eventType: partial.eventType ?? 'other',
    status: partial.status ?? 'scheduled',
    ministryName: partial.ministryName,
    startTime: partial.startTime,
    ...partial,
  };
}

describe('filterChurchEventsForPicker', () => {
  const events = [
    event({
      id: '1',
      eventDate: '2026-07-19',
      title: 'Morning Worship',
      eventType: 'worship',
    }),
    event({
      id: '2',
      eventDate: '2026-07-25',
      title: 'Youth Praise Dance',
      eventType: 'meeting',
      ministryName: 'Youth Ministry',
    }),
    event({
      id: '3',
      eventDate: '2026-08-15',
      title: 'Food Pantry',
      eventType: 'outreach',
    }),
  ];

  it('filters by search text across title and ministry', () => {
    expect(
      filterChurchEventsForPicker(events, 'youth', 'all', '2026-07-18').map((e) => e.id),
    ).toEqual(['2']);
  });

  it('filters by type', () => {
    expect(
      filterChurchEventsForPicker(events, '', 'worship', '2026-07-18').map((e) => e.id),
    ).toEqual(['1']);
  });

  it('limits to the upcoming week', () => {
    expect(
      filterChurchEventsForPicker(events, '', 'upcoming-week', '2026-07-18').map((e) => e.id),
    ).toEqual(['1', '2']);
  });

  it('limits to the next 2 weeks', () => {
    expect(
      filterChurchEventsForPicker(
        events,
        '',
        'upcoming-2-weeks',
        '2026-07-18',
      ).map((e) => e.id),
    ).toEqual(['1', '2']);
    expect(
      filterChurchEventsForPicker(
        [
          ...events,
          event({
            id: '4',
            eventDate: '2026-08-01',
            title: 'Later worship',
            eventType: 'worship',
          }),
        ],
        '',
        'upcoming-2-weeks',
        '2026-07-18',
      ).map((e) => e.id),
    ).toEqual(['1', '2', '4']);
  });

  it('music-plan purpose drops classes and other-ministry meetings', () => {
    const crowded = [
      ...events,
      event({
        id: '4',
        eventDate: '2026-07-20',
        title: 'Sunday School',
        eventType: 'worship',
      }),
      event({
        id: '5',
        eventDate: '2026-07-22',
        title: 'Midweek Prayer',
        eventType: 'meeting',
      }),
    ];
    expect(
      filterChurchEventsForPicker(
        crowded,
        '',
        'all',
        '2026-07-18',
        'music-plan',
      ).map((e) => e.id),
    ).toEqual(['1']);
  });
});
