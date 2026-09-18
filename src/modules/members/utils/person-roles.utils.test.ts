import { describe, expect, it } from 'vitest';

import {
  availableDirectoryRolesToAdd,
  formatDirectoryRoleLabels,
} from './person-roles.utils';

describe('formatDirectoryRoleLabels', () => {
  it('includes membership status and app role labels', () => {
    expect(
      formatDirectoryRoleLabels({
        membershipStatus: 'member',
        roles: ['choir_director', 'deacon'],
      }),
    ).toEqual(['Member', 'Choir Director', 'Deacon']);
  });

  it('dedupes overlapping labels', () => {
    expect(
      formatDirectoryRoleLabels({
        membershipStatus: 'member',
        roles: [],
      }),
    ).toEqual(['Member']);
  });
});

describe('availableDirectoryRolesToAdd', () => {
  it('excludes roles the person already has', () => {
    const available = availableDirectoryRolesToAdd(['choir_member', 'deacon']);
    expect(available).not.toContain('choir_member');
    expect(available).not.toContain('deacon');
    expect(available).toContain('volunteer');
  });

  it('limits juniors to choir, band, and volunteer', () => {
    const junior = { dateOfBirth: '2012-01-01' };
    const available = availableDirectoryRolesToAdd([], junior);
    expect(available).toEqual(['choir_member', 'band_member', 'volunteer']);
  });
});
