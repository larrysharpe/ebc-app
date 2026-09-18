import { describe, expect, it } from 'vitest';

import {
  createEmptyPractice,
  getPlanPractices,
  parsePracticesJson,
  withSyncedPractices,
} from './plan-practice.utils';
import type { ServiceMusicPlan } from '../types';

function basePlan(
  overrides: Partial<ServiceMusicPlan> = {},
): ServiceMusicPlan {
  return {
    id: 'plan-1',
    title: 'Test',
    choirGroup: 'youth',
    serviceDate: '2026-07-26',
    status: 'draft',
    directorName: 'Director',
    songs: [],
    ...overrides,
  };
}

describe('plan-practice.utils', () => {
  it('falls back to legacy practice fields', () => {
    const practices = getPlanPractices(
      basePlan({
        practiceDate: '2026-07-18',
        practiceStartTime: '09:00',
        practiceEndTime: '11:00',
        practiceLocation: 'Chapel',
      }),
    );
    expect(practices).toHaveLength(1);
    expect(practices[0]?.date).toBe('2026-07-18');
    expect(practices[0]?.location).toBe('Chapel');
  });

  it('prefers practices array over legacy fields', () => {
    const practices = getPlanPractices(
      basePlan({
        practiceDate: 'legacy',
        practices: [
          createEmptyPractice({
            id: 'a',
            date: '2026-07-10',
            startTime: '18:00',
          }),
          createEmptyPractice({
            id: 'b',
            date: '2026-07-17',
            startTime: '18:00',
          }),
        ],
      }),
    );
    expect(practices).toHaveLength(2);
    expect(practices[0]?.date).toBe('2026-07-10');
  });

  it('syncs first practice into legacy fields', () => {
    const synced = withSyncedPractices(basePlan(), [
      createEmptyPractice({
        id: 'a',
        date: '2026-07-10',
        startTime: '18:00',
        endTime: '20:00',
        location: 'Sanctuary',
      }),
      createEmptyPractice({
        id: 'b',
        date: '2026-07-17',
        startTime: '18:00',
      }),
    ]);
    expect(synced.practices).toHaveLength(2);
    expect(synced.practiceDate).toBe('2026-07-10');
    expect(synced.practiceStartTime).toBe('18:00');
    expect(synced.practiceLocation).toBe('Sanctuary');
  });

  it('parses practices JSON safely', () => {
    expect(parsePracticesJson(null)).toEqual([]);
    expect(
      parsePracticesJson([
        { id: 'x', date: '2026-07-10', startTime: '09:00' },
        { bad: true },
      ]),
    ).toEqual([
      { id: 'x', date: '2026-07-10', startTime: '09:00', endTime: '', location: '' },
    ]);
  });
});
