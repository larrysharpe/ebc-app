import { describe, expect, it } from 'vitest';

import type { ServiceMusicPlan } from '../../types';
import type { Choir } from '../../types/choir.types';
import {
  choirsForPerson,
  filterPlansForDirectorScope,
  formatChoirParticipation,
  ledChoirIdsForPerson,
  nextDefaultServiceDateForChoir,
  participationForPerson,
} from './my-choirs.utils';

const youth: Choir = {
  id: 'youth',
  name: 'Youth Choir',
  leaders: [{ personId: 'person-leader', title: 'Deaconess' }],
  members: [
    { personId: 'person-singer', role: 'singer' },
    { personId: 'person-solo', role: 'soloist' },
  ],
  defaultSunday: 2,
  sortOrder: 2,
  active: true,
};

const combined: Choir = {
  id: 'combined',
  name: 'Combined Choir',
  leaders: [{ personId: 'person-leader' }],
  members: [{ personId: 'person-singer', role: 'singer' }],
  defaultSunday: null,
  sortOrder: 100,
  active: true,
};

function plan(
  partial: Partial<ServiceMusicPlan> &
    Pick<ServiceMusicPlan, 'id' | 'choirGroup' | 'serviceDate'>,
): ServiceMusicPlan {
  return {
    title: 'Engagement',
    status: 'draft',
    directorName: 'Sister Stewart',
    songs: [],
    ...partial,
  };
}

describe('my-choirs.utils', () => {
  it('resolves leader and member participation', () => {
    expect(participationForPerson(youth, 'person-leader')).toEqual({
      kind: 'leader',
      title: 'Deaconess',
    });
    expect(participationForPerson(youth, 'person-solo')).toEqual({
      kind: 'member',
      role: 'soloist',
    });
    expect(participationForPerson(youth, 'person-missing')).toBeNull();
  });

  it('lists choir ids a person leads', () => {
    expect(ledChoirIdsForPerson([youth, combined], 'person-leader')).toEqual([
      'youth',
      'combined',
    ]);
    expect(ledChoirIdsForPerson([youth, combined], 'person-singer')).toEqual([]);
    expect(ledChoirIdsForPerson([youth], null)).toEqual([]);
  });

  it('scopes draft plans to led choirs unless seeAll', () => {
    const plans = [
      plan({ id: 'a', choirGroup: 'youth', serviceDate: '2026-08-09' }),
      plan({ id: 'b', choirGroup: 'adult', serviceDate: '2026-08-16' }),
    ];
    expect(
      filterPlansForDirectorScope(plans, {
        seeAll: true,
        ledChoirIds: ['youth'],
      }).map((row) => row.id),
    ).toEqual(['a', 'b']);
    expect(
      filterPlansForDirectorScope(plans, {
        seeAll: false,
        ledChoirIds: ['youth'],
      }).map((row) => row.id),
    ).toEqual(['a']);
  });

  it('formats participation labels', () => {
    expect(
      formatChoirParticipation({ kind: 'leader', title: 'Deaconess' }),
    ).toBe('Leader · Deaconess');
    expect(formatChoirParticipation({ kind: 'member', role: 'singer' })).toBe(
      'Singer',
    );
  });

  it('finds next default Sunday on or after from date', () => {
    // 2026-07-18 is a Saturday; 2nd Sunday of July 2026 is 2026-07-12 (past)
    // so next 2nd Sunday is August → 2026-08-09
    expect(nextDefaultServiceDateForChoir(2, '2026-07-18')).toBe('2026-08-09');
    expect(nextDefaultServiceDateForChoir(null, '2026-07-18')).toBeNull();
  });

  it('lists active choirs for a person ordered by next date', () => {
    const memberships = choirsForPerson(
      [youth, combined],
      'person-singer',
      [
        plan({
          id: 'p1',
          choirGroup: 'combined',
          serviceDate: '2026-12-20',
          title: 'Christmas',
        }),
      ],
      '2026-07-18',
    );
    expect(memberships.map((row) => row.choir.id)).toEqual([
      'youth',
      'combined',
    ]);
    expect(memberships[0]?.nextServiceDate).toBe('2026-08-09');
    expect(memberships[1]?.nextServiceDate).toBe('2026-12-20');
  });
});
