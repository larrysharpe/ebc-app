import { describe, expect, it } from 'vitest';

import {
  expandRecurrenceDates,
  formatRecurrenceLabel,
} from './event-recurrence.utils';

describe('event-recurrence utils', () => {
  it('labels 1st & 3rd Fridays from a Friday start', () => {
    // 2026-09-04 is the 1st Friday of September
    expect(formatRecurrenceLabel('first_and_third', '2026-09-04')).toBe(
      '1st & 3rd Fridays',
    );
  });

  it('expands weekly Fridays across a short window', () => {
    const dates = expandRecurrenceDates({
      startDate: '2026-09-04',
      pattern: 'weekly',
      untilDate: '2026-09-25',
    });
    expect(dates).toEqual([
      '2026-09-04',
      '2026-09-11',
      '2026-09-18',
      '2026-09-25',
    ]);
  });

  it('expands 1st & 3rd Fridays', () => {
    const dates = expandRecurrenceDates({
      startDate: '2026-09-04',
      pattern: 'first_and_third',
      untilDate: '2026-10-31',
    });
    expect(dates).toEqual([
      '2026-09-04',
      '2026-09-18',
      '2026-10-02',
      '2026-10-16',
    ]);
  });

  it('expands biweekly from the start date', () => {
    const dates = expandRecurrenceDates({
      startDate: '2026-09-04',
      pattern: 'biweekly',
      untilDate: '2026-10-02',
    });
    expect(dates).toEqual(['2026-09-04', '2026-09-18', '2026-10-02']);
  });

  it('returns only the start date for none', () => {
    expect(
      expandRecurrenceDates({
        startDate: '2026-09-04',
        pattern: 'none',
        untilDate: '2026-12-01',
      }),
    ).toEqual(['2026-09-04']);
  });

  it('expands custom weekdays every 2 weeks', () => {
    // 2026-09-04 Friday — custom Mon+Fri every 2 weeks
    const dates = expandRecurrenceDates({
      startDate: '2026-09-04',
      pattern: 'custom',
      untilDate: '2026-09-25',
      weekdays: [1, 5],
      intervalWeeks: 2,
    });
    expect(dates).toEqual([
      '2026-09-04', // Fri week 0
      '2026-09-07', // Mon week 0
      '2026-09-18', // Fri week 2
      '2026-09-21', // Mon week 2
    ]);
  });

  it('labels custom recurrence', () => {
    expect(
      formatRecurrenceLabel('custom', '2026-09-04', {
        weekdays: [1, 3, 5],
        intervalWeeks: 1,
      }),
    ).toBe('Custom · Mon, Wed, Fri');
  });
});
