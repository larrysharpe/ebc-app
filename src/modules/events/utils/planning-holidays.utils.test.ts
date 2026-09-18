import { describe, expect, it } from 'vitest';

import {
  easterSundayIso,
  listPlanningHolidays,
} from './planning-holidays.utils';

describe('planning-holidays', () => {
  it('computes Easter Sunday for a known year', () => {
    expect(easterSundayIso(2026)).toBe('2026-04-05');
  });

  it('lists holidays inside a window', () => {
    const holidays = listPlanningHolidays('2026-07-01', '2026-07-10');
    expect(holidays.some((h) => h.date === '2026-07-04' && h.name === 'Independence Day')).toBe(
      true,
    );
    expect(holidays.every((h) => h.date >= '2026-07-01' && h.date <= '2026-07-10')).toBe(
      true,
    );
  });
});
