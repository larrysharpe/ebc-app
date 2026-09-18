import type { AuthUserRecord, UserRole } from '@/modules/auth/types/auth.types';
import type { AdminUser, UserAdminContext } from '@/modules/auth/types/user-admin.types';
import { isPlatformAdmin } from '@/modules/auth/utils/ministry-scope.utils';
import { isSuperAdmin } from '@/modules/auth/utils/roles.utils';

export function toAdminUser(record: AuthUserRecord): AdminUser {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    roles: record.roles,
    status: record.status,
    ministryIds: record.ministryIds,
    choirIds: record.choirIds,
  };
}

/** Admins cannot assign or modify super_admin / webmaster accounts. */
export function canManageTargetUser(
  actor: UserAdminContext,
  target: Pick<AdminUser, 'roles' | 'id'>,
): boolean {
  if (!isPlatformAdmin(actor.roles)) return false;
  if (isSuperAdmin(actor.roles)) return true;
  if (target.roles.includes('super_admin') || target.roles.includes('webmaster')) {
    return false;
  }
  return true;
}

export function canAssignRole(actor: UserAdminContext, role: UserRole): boolean {
  if (!isPlatformAdmin(actor.roles)) return false;
  if (isSuperAdmin(actor.roles)) return true;
  return role !== 'super_admin' && role !== 'webmaster';
}

export function canAssignRoles(actor: UserAdminContext, roles: readonly UserRole[]): boolean {
  return roles.every((role) => canAssignRole(actor, role));
}

export function assignableRolesFor(actor: UserAdminContext): UserRole[] {
  const all: UserRole[] = [
    'super_admin',
    'admin',
    'webmaster',
    'pastor',
    'office_staff',
    'finance',
    'trustee',
    'deacon',
    'music_minister',
    'choir_director',
    'choir_member',
    'band_director',
    'band_member',
    'social_manager',
    'facility_manager',
    'ministry_leader',
    'volunteer',
  ];
  return all.filter((role) => canAssignRole(actor, role));
}
