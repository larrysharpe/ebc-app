import { describe, expect, it } from 'vitest';

import {
  intervalsOverlap,
  resolveIntervalMinutes,
  timeToMinutes,
} from '@/modules/events/utils/event-time-overlap.utils';

describe('event-time-overlap.utils', () => {
  it('parses HH:MM to minutes', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(timeToMinutes('')).toBeNull();
    expect(timeToMinutes('25:00')).toBeNull();
  });

  it('treats missing times as all-day', () => {
    expect(resolveIntervalMinutes({})).toEqual({ start: 0, end: 1440 });
  });

  it('detects overlapping meeting windows', () => {
    expect(
      intervalsOverlap(
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '09:30', endTime: '10:30' },
      ),
    ).toBe(true);
    expect(
      intervalsOverlap(
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' },
      ),
    ).toBe(false);
  });

  it('all-day blocks any timed booking the same day', () => {
    expect(
      intervalsOverlap({}, { startTime: '19:00', endTime: '21:00' }),
    ).toBe(true);
  });
});
