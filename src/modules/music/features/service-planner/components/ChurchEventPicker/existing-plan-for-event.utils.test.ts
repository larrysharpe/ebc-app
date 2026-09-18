import { describe, expect, it } from 'vitest';

import type { ChurchEvent } from '@/modules/events/types/church-event.types';

import {
  buildExistingPlansByEventId,
  isEventToday,
} from './existing-plan-for-event.utils';

function event(
  partial: Partial<ChurchEvent> & Pick<ChurchEvent, 'id' | 'eventDate'>,
): ChurchEvent {
  return {
    title: 'Morning Worship',
    eventType: 'worship',
    status: 'scheduled',
    ...partial,
  };
}

describe('buildExistingPlansByEventId', () => {
  it('matches by churchEventId', () => {
    const events = [
      event({ id: 'evt-1', eventDate: '2026-07-26' }),
      event({ id: 'evt-2', eventDate: '2026-07-26' }),
    ];
    const map = buildExistingPlansByEventId(events, [
      {
        id: 'plan-a',
        title: 'Linked plan',
        status: 'draft',
        churchEventId: 'evt-2',
        serviceDate: '2026-07-26',
      },
    ]);
    expect(map['evt-2']?.planId).toBe('plan-a');
    expect(map['evt-1']).toBeUndefined();
  });

  it('falls back to service date when plan has no churchEventId', () => {
    const events = [event({ id: 'evt-today', eventDate: '2026-07-26' })];
    const map = buildExistingPlansByEventId(events, [
      {
        id: 'plan-today',
        title: 'Today plan',
        status: 'sent',
        serviceDate: '2026-07-26',
      },
    ]);
    expect(map['evt-today']).toEqual({
      planId: 'plan-today',
      title: 'Today plan',
      status: 'sent',
    });
  });
});

describe('isEventToday', () => {
  it('compares ISO dates', () => {
    expect(isEventToday('2026-07-26', '2026-07-26')).toBe(true);
    expect(isEventToday('2026-07-27', '2026-07-26')).toBe(false);
  });
});
