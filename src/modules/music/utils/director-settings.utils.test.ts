import { describe, expect, it } from 'vitest';

import { DEFAULT_CHOIR_DIRECTOR_SETTINGS } from '../types/director-settings.types';
import { STANDARD_SERVICE_SLOT_TYPES } from '../types';
import {
  buildPlanDefaultsFromSettings,
  buildPracticesFromSettings,
  formatPracticeRelativeLabel,
  getDefaultServiceSlotsFromSettings,
  getPracticeDateForService,
  normalizeDefaultPractices,
  normalizeDefaultServiceSlots,
  resolveDefaultChoirForPlan,
} from './director-settings.utils';

describe('getPracticeDateForService', () => {
  it('returns the Saturday before a Sunday service', () => {
    expect(getPracticeDateForService('2026-07-19', 6)).toBe('2026-07-18');
  });

  it('returns the Friday before when practice weekday is Friday', () => {
    expect(getPracticeDateForService('2026-07-19', 5)).toBe('2026-07-17');
  });

  it('returns two Saturdays before when weeksBefore is 2', () => {
    expect(getPracticeDateForService('2026-07-19', 6, 2)).toBe('2026-07-11');
  });

  it('returns three Saturdays before when weeksBefore is 3', () => {
    expect(getPracticeDateForService('2026-07-19', 6, 3)).toBe('2026-07-04');
  });
});

describe('formatPracticeRelativeLabel', () => {
  it('labels the week before and multi-week offsets', () => {
    expect(formatPracticeRelativeLabel(6, 1)).toBe('Saturday before they sing');
    expect(formatPracticeRelativeLabel(6, 2)).toBe('2 Saturdays before they sing');
  });
});

describe('normalizeDefaultPractices', () => {
  it('falls back to a Saturday-before template when empty', () => {
    const practices = normalizeDefaultPractices([]);
    expect(practices).toHaveLength(1);
    expect(practices[0]?.weekday).toBe(6);
    expect(practices[0]?.weeksBefore).toBe(1);
  });

  it('synthesizes from legacy fields when JSON is empty', () => {
    const practices = normalizeDefaultPractices([], {
      practiceWeekday: 5,
      practiceStartTime: '18:00',
      practiceEndTime: '20:00',
    });
    expect(practices[0]).toMatchObject({
      weekday: 5,
      weeksBefore: 1,
      startTime: '18:00',
      endTime: '20:00',
    });
  });
});

describe('resolveDefaultChoirForPlan', () => {
  it('uses chapel rotation for a Sunday service date', () => {
    // 2026-07-19 is 3rd Sunday → Adult Choir
    expect(resolveDefaultChoirForPlan('2026-07-19', DEFAULT_CHOIR_DIRECTOR_SETTINGS)).toBe(
      'adult',
    );
  });

  it('falls back to director default when date is not a Sunday', () => {
    expect(
      resolveDefaultChoirForPlan('2026-07-18', {
        ...DEFAULT_CHOIR_DIRECTOR_SETTINGS,
        defaultChoirGroup: 'mens',
      }),
    ).toBe('mens');
  });
});

describe('buildPlanDefaultsFromSettings', () => {
  it('combines rotation choir with practice window from settings', () => {
    const defaults = buildPlanDefaultsFromSettings(
      '2026-07-19',
      DEFAULT_CHOIR_DIRECTOR_SETTINGS,
    );
    expect(defaults.choirGroup).toBe('adult');
    expect(defaults.serviceStartTime).toBe('11:00');
    expect(defaults.serviceEndTime).toBe('13:00');
    expect(defaults.practiceDate).toBe('2026-07-18');
    expect(defaults.practiceStartTime).toBe('09:00');
    expect(defaults.practiceEndTime).toBe('11:00');
    expect(defaults.practices).toHaveLength(1);
    expect(defaults.practices[0]?.date).toBe('2026-07-18');
  });

  it('builds multiple relative practices sorted by date', () => {
    const practices = buildPracticesFromSettings('2026-07-19', {
      ...DEFAULT_CHOIR_DIRECTOR_SETTINGS,
      defaultPractices: [
        {
          id: 'p1',
          weekday: 6,
          weeksBefore: 1,
          startTime: '09:00',
          endTime: '11:00',
        },
        {
          id: 'p2',
          weekday: 6,
          weeksBefore: 2,
          startTime: '09:00',
          endTime: '11:00',
        },
      ],
    });

    expect(practices.map((item) => item.date)).toEqual(['2026-07-11', '2026-07-18']);
  });
});

describe('normalizeDefaultServiceSlots', () => {
  it('returns a copy of the provided slots', () => {
    expect(normalizeDefaultServiceSlots(['welcome', 'offering'])).toEqual([
      'welcome',
      'offering',
    ]);
  });

  it('falls back to the chapel template when empty', () => {
    expect(normalizeDefaultServiceSlots([])).toEqual([...STANDARD_SERVICE_SLOT_TYPES]);
  });
});

describe('getDefaultServiceSlotsFromSettings', () => {
  it('reads the configured template', () => {
    expect(
      getDefaultServiceSlotsFromSettings({
        ...DEFAULT_CHOIR_DIRECTOR_SETTINGS,
        defaultServiceSlots: ['welcome', 'worship'],
      }),
    ).toEqual(['welcome', 'worship']);
  });
});
