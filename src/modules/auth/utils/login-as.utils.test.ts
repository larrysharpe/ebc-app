import { describe, expect, it } from 'vitest';

import type { SessionUser } from '@/modules/auth/types/auth.types';
import { canLoginAsUsers, getSessionActor } from '@/modules/auth/utils/login-as.utils';

const superAdmin: SessionUser = {
  id: 'sa-1',
  email: 'superadmin@ebenezerbc.org',
  name: 'Super Admin',
  roles: ['super_admin'],
  ministryIds: [],
  choirIds: [],
};

const choirMember: SessionUser = {
  id: 'cm-1',
  email: 'singer@ebenezerbc.org',
  name: 'Choir Member',
  roles: ['choir_member'],
  ministryIds: [],
  choirIds: [],
};

describe('canLoginAsUsers', () => {
  it('allows Super Admin', () => {
    expect(canLoginAsUsers(superAdmin)).toBe(true);
  });

  it('denies other roles', () => {
    expect(canLoginAsUsers(choirMember)).toBe(false);
  });

  it('allows when the impersonator is Super Admin', () => {
    expect(
      canLoginAsUsers({
        ...choirMember,
        impersonator: {
          id: superAdmin.id,
          email: superAdmin.email,
          name: superAdmin.name,
          roles: superAdmin.roles,
          ministryIds: [],
          choirIds: [],
        },
      }),
    ).toBe(true);
  });
});

describe('getSessionActor', () => {
  it('returns the impersonator when present', () => {
    const actor = getSessionActor({
      ...choirMember,
      impersonator: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        roles: superAdmin.roles,
        ministryIds: [],
        choirIds: [],
      },
    });
    expect(actor.id).toBe(superAdmin.id);
    expect(actor.roles).toEqual(['super_admin']);
  });
});
