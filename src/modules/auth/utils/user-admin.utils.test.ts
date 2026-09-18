import { describe, expect, it } from 'vitest';

import {
  assignableRolesFor,
  canAssignRole,
  canAssignRoles,
  canManageTargetUser,
} from '@/modules/auth/utils/user-admin.utils';

describe('user-admin.utils', () => {
  it('lets super_admin assign any role', () => {
    expect(canAssignRole({ id: '1', roles: ['super_admin'] }, 'super_admin')).toBe(true);
    expect(canAssignRole({ id: '1', roles: ['super_admin'] }, 'ministry_leader')).toBe(true);
  });

  it('blocks admin from super_admin and webmaster roles', () => {
    expect(canAssignRole({ id: '1', roles: ['admin'] }, 'super_admin')).toBe(false);
    expect(canAssignRole({ id: '1', roles: ['admin'] }, 'webmaster')).toBe(false);
    expect(canAssignRole({ id: '1', roles: ['admin'] }, 'office_staff')).toBe(true);
  });

  it('blocks admin from editing super_admin or webmaster accounts', () => {
    expect(
      canManageTargetUser(
        { id: '1', roles: ['admin'] },
        { id: '2', roles: ['super_admin'] },
      ),
    ).toBe(false);
    expect(
      canManageTargetUser(
        { id: '1', roles: ['admin'] },
        { id: '3', roles: ['webmaster'] },
      ),
    ).toBe(false);
    expect(
      canManageTargetUser(
        { id: '1', roles: ['super_admin'] },
        { id: '2', roles: ['super_admin'] },
      ),
    ).toBe(true);
  });

  it('excludes super_admin and webmaster from admin assignable roles', () => {
    const roles = assignableRolesFor({ id: '1', roles: ['admin'] });
    expect(roles).not.toContain('super_admin');
    expect(roles).not.toContain('webmaster');
    expect(roles).toContain('ministry_leader');
  });

  it('validates every role in a multi-role assignment', () => {
    expect(
      canAssignRoles({ id: '1', roles: ['admin'] }, ['deacon', 'choir_member', 'ministry_leader']),
    ).toBe(true);
    expect(
      canAssignRoles({ id: '1', roles: ['admin'] }, ['deacon', 'super_admin']),
    ).toBe(false);
  });
});
