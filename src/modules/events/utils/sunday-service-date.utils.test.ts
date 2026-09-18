import { describe, expect, it } from 'vitest';

import { getNextUnscheduledDate } from './sunday-service-date.utils';

describe('getNextUnscheduledDate', () => {
  it('returns from when that day is open', () => {
    expect(getNextUnscheduledDate([], '2026-07-18')).toBe('2026-07-18');
  });

  it('skips days that already have a service', () => {
    expect(
      getNextUnscheduledDate(['2026-07-18', '2026-07-19'], '2026-07-18'),
    ).toBe('2026-07-20');
  });

  it('works for midweek dates, not only Sundays', () => {
    expect(getNextUnscheduledDate([], '2026-07-15')).toBe('2026-07-15');
  });
});
