import { describe, expect, it } from 'vitest';

import type { DirectoryPerson } from '@/modules/members/types';

import {
  groupPeopleByMusicRole,
  musicManageableRolesOf,
  musicMinisters,
} from './music-people.utils';

function person(
  partial: Pick<DirectoryPerson, 'id' | 'firstName' | 'lastName' | 'roles'> &
    Partial<DirectoryPerson>,
): DirectoryPerson {
  return {
    membershipStatus: 'member',
    isMinor: false,
    createdAt: '',
    updatedAt: '',
    ministryIds: [],
    choirIds: [],
    ...partial,
  };
}

describe('music-people.utils', () => {
  it('extracts manageable music roles', () => {
    expect(
      musicManageableRolesOf(['choir_member', 'deacon', 'music_minister']),
    ).toEqual(['choir_member']);
  });

  it('groups people by role and sorts by name', () => {
    const people = [
      person({
        id: '1',
        firstName: 'Zed',
        lastName: 'Young',
        roles: ['choir_member', 'band_member'],
      }),
      person({
        id: '2',
        firstName: 'Ann',
        lastName: 'Adams',
        roles: ['choir_director', 'choir_member'],
      }),
    ];

    const groups = groupPeopleByMusicRole(people);
    expect(groups.find((g) => g.role === 'choir_director')?.people.map((p) => p.id)).toEqual([
      '2',
    ]);
    expect(groups.find((g) => g.role === 'choir_member')?.people.map((p) => p.id)).toEqual([
      '2',
      '1',
    ]);
    expect(groups.find((g) => g.role === 'band_member')?.people.map((p) => p.id)).toEqual([
      '1',
    ]);
  });

  it('lists music ministers separately', () => {
    const people = [
      person({
        id: '1',
        firstName: 'Lydia',
        lastName: 'Stewart',
        roles: ['music_minister', 'choir_director'],
      }),
    ];
    expect(musicMinisters(people).map((p) => p.id)).toEqual(['1']);
  });
});
