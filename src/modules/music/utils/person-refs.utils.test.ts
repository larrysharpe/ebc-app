import { describe, expect, it } from 'vitest';

import type { Person } from '@/modules/members/types/person.types';

import {
  formatLeadersList,
  parseChoirLeader,
  parseChoirMember,
  resolveMusicianDisplayName,
} from './person-refs.utils';

const people: Person[] = [
  {
    id: 'person-lydia-stewart',
    firstName: 'Lydia',
    lastName: 'Stewart',
    isMinor: false,
    membershipStatus: 'member',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'person-andre-porter',
    firstName: 'Andre',
    lastName: 'Porter',
    isMinor: false,
    membershipStatus: 'hired',
    createdAt: '',
    updatedAt: '',
  },
];

describe('person-refs.utils', () => {
  it('parses personId leaders and legacy name leaders', () => {
    expect(parseChoirLeader({ personId: 'person-lydia-stewart', title: 'Deaconess' })).toEqual({
      personId: 'person-lydia-stewart',
      title: 'Deaconess',
    });
    expect(parseChoirLeader({ name: 'Lydia Stewart', title: 'Deaconess' })).toEqual({
      personId: 'person-lydia-stewart',
      title: 'Deaconess',
    });
  });

  it('parses choir members by personId and role', () => {
    expect(parseChoirMember({ personId: 'person-andre-porter' })).toEqual({
      personId: 'person-andre-porter',
      role: 'singer',
    });
    expect(
      parseChoirMember({ personId: 'person-andre-porter', role: 'band' }),
    ).toEqual({
      personId: 'person-andre-porter',
      role: 'band',
    });
    expect(parseChoirMember({})).toBeNull();
  });

  it('formats leaders from Person records', () => {
    const map = new Map(people.map((p) => [p.id, p]));
    expect(
      formatLeadersList([{ personId: 'person-lydia-stewart', title: 'Deaconess' }], map),
    ).toBe('Deaconess Lydia Stewart');
  });

  it('resolves musician display names from personId', () => {
    const map = new Map(people.map((p) => [p.id, p]));
    expect(resolveMusicianDisplayName('Andre Porter', 'person-andre-porter', map)).toBe(
      'Andre Porter',
    );
    expect(resolveMusicianDisplayName('Fallback', undefined, map)).toBe('Fallback');
  });
});
