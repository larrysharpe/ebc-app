import { describe, expect, it } from 'vitest';

import {
  formatSundayLabel,
  getDefaultSundayForChoir,
  getNextServiceDateForChoir,
  getNthSundayOfMonth,
} from './choir-schedule.utils';

describe('formatSundayLabel', () => {
  it('uses correct ordinals including 5th', () => {
    expect(formatSundayLabel(1)).toBe('1st Sunday');
    expect(formatSundayLabel(2)).toBe('2nd Sunday');
    expect(formatSundayLabel(3)).toBe('3rd Sunday');
    expect(formatSundayLabel(4)).toBe('4th Sunday');
    expect(formatSundayLabel(5)).toBe('5th Sunday');
  });
});

describe('getDefaultSundayForChoir', () => {
  it('maps each chapel choir to its rotation Sunday', () => {
    expect(getDefaultSundayForChoir('senior')).toBe(1);
    expect(getDefaultSundayForChoir('youth')).toBe(2);
    expect(getDefaultSundayForChoir('adult')).toBe(3);
    expect(getDefaultSundayForChoir('mens')).toBe(4);
    expect(getDefaultSundayForChoir('young_adult')).toBe(5);
  });
});

describe('getNthSundayOfMonth', () => {
  it('returns the 2nd Sunday of July 2026', () => {
    expect(getNthSundayOfMonth(2026, 6, 2)).toBe('2026-07-12');
  });

  it('returns null when the month has no 5th Sunday', () => {
    // July 2026 has 5 Sundays (5, 12, 19, 26 — wait July 2026: Jul 5,12,19,26 = only 4?
    // August 2026: Aug 2,9,16,23,30 = 5th exists
    // June 2026: Jun 7,14,21,28 = 4 only
    expect(getNthSundayOfMonth(2026, 5, 5)).toBeNull();
  });
});

describe('getNextServiceDateForChoir', () => {
  it('picks the next 2nd Sunday for Youth Choir', () => {
    expect(getNextServiceDateForChoir('youth', '2026-07-01')).toBe('2026-07-12');
  });

  it('skips a past Sunday in the same month', () => {
    expect(getNextServiceDateForChoir('youth', '2026-07-13')).toBe('2026-08-09');
  });

  it('finds a later month for Young Adult (5th Sunday) when needed', () => {
    // June 2026 has no 5th Sunday; August 2026 has Aug 30
    expect(getNextServiceDateForChoir('young_adult', '2026-06-01')).toBe('2026-08-30');
  });
});
