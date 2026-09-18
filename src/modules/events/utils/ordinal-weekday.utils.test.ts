import { describe, expect, it } from 'vitest';

import { formatOrdinalWeekday } from './ordinal-weekday.utils';

describe('formatOrdinalWeekday', () => {
  it('labels Sundays by occurrence in the month', () => {
    expect(formatOrdinalWeekday('2026-07-05')).toBe('1st Sunday');
    expect(formatOrdinalWeekday('2026-07-12')).toBe('2nd Sunday');
    expect(formatOrdinalWeekday('2026-07-19')).toBe('3rd Sunday');
  });

  it('labels other weekdays the same way', () => {
    expect(formatOrdinalWeekday('2026-07-06')).toBe('1st Monday');
    expect(formatOrdinalWeekday('2026-07-20')).toBe('3rd Monday');
  });

  it('returns null for invalid dates', () => {
    expect(formatOrdinalWeekday('not-a-date')).toBeNull();
  });
});
