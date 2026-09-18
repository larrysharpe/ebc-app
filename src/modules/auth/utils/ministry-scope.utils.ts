import {
  GLOBAL_MINISTRY_ACCESS_ROLES,
  MINISTRY_ID_BY_SLUG,
  MINISTRY_NAME_BY_ID,
  MINISTRY_SLUG_BY_ID,
  type MinistryScopeId,
} from '@/modules/auth/constants/ministry-scope.constants';
import type { SessionUser, UserRole } from '@/modules/auth/types/auth.types';
import { hasAnyRole, normalizeRoles } from '@/modules/auth/utils/roles.utils';

export type MinistryAccessUser = Pick<SessionUser, 'roles' | 'ministryIds'>;

function toMinistryAccessUser(
  user: MinistryAccessUser | UserRole | readonly UserRole[] | string,
): MinistryAccessUser {
  if (typeof user === 'string') {
    return { roles: normalizeRoles(user), ministryIds: [] };
  }
  if ('roles' in user) {
    return {
      roles: normalizeRoles(user.roles),
      ministryIds: user.ministryIds ?? [],
    };
  }
  return { roles: normalizeRoles(user), ministryIds: [] };
}

export function isPlatformAdmin(
  roleOrRoles: UserRole | readonly UserRole[] | string,
): boolean {
  const roles = normalizeRoles(roleOrRoles);
  return roles.includes('super_admin') || roles.includes('admin');
}

export function hasGlobalMinistryAccess(
  roleOrRoles: UserRole | readonly UserRole[] | string,
): boolean {
  const roles = normalizeRoles(roleOrRoles);
  return hasAnyRole(roles, GLOBAL_MINISTRY_ACCESS_ROLES);
}

export function canAccessMinistrySlug(
  user: MinistryAccessUser | UserRole | readonly UserRole[] | string,
  slug: string,
): boolean {
  const accessUser = toMinistryAccessUser(user);
  if (hasGlobalMinistryAccess(accessUser.roles)) return true;
  if (!accessUser.roles.includes('ministry_leader')) return false;

  const ministryId = MINISTRY_ID_BY_SLUG[slug];
  if (!ministryId) return false;
  return accessUser.ministryIds.includes(ministryId);
}

export function canManageMinistry(
  user: MinistryAccessUser | UserRole | readonly UserRole[] | string,
  ministryId: string,
): boolean {
  const accessUser = toMinistryAccessUser(user);
  if (hasGlobalMinistryAccess(accessUser.roles)) return true;
  if (
    accessUser.roles.includes('ministry_leader') &&
    accessUser.ministryIds.includes(ministryId)
  ) {
    return true;
  }
  return false;
}

export function ministryIdForSlug(slug: string): string | null {
  return MINISTRY_ID_BY_SLUG[slug] ?? null;
}

export function filterMinistriesForUser<T extends { id: string }>(
  user: MinistryAccessUser | UserRole | readonly UserRole[] | string,
  ministries: T[],
): T[] {
  const accessUser = toMinistryAccessUser(user);
  if (hasGlobalMinistryAccess(accessUser.roles)) return ministries;
  if (accessUser.roles.includes('ministry_leader') && accessUser.ministryIds.length > 0) {
    return ministries.filter((ministry) => accessUser.ministryIds.includes(ministry.id));
  }
  return [];
}

export function getMinistryScopeLabel(ministryId: string | null): string | null {
  if (!ministryId) return null;
  return MINISTRY_NAME_BY_ID[ministryId as MinistryScopeId] ?? null;
}

export function formatMinistryScopeLabels(ministryIds: readonly string[]): string {
  return ministryIds
    .map((id) => getMinistryScopeLabel(id))
    .filter((name): name is string => Boolean(name))
    .join(', ');
}

export function isScopedMinistryLeader(user: MinistryAccessUser): boolean {
  return (
    user.roles.includes('ministry_leader') &&
    user.ministryIds.length > 0 &&
    !hasGlobalMinistryAccess(user.roles)
  );
}

/** Sole role is ministry_leader with at least one assigned ministry — nav should be ministry-scoped. */
export function isMinistryOnlyLeader(user: MinistryAccessUser): boolean {
  const roles = normalizeRoles(user.roles);
  return (
    roles.length === 1 &&
    roles[0] === 'ministry_leader' &&
    user.ministryIds.length > 0 &&
    !hasGlobalMinistryAccess(roles)
  );
}

/** Pastor / platform admins may mark ministry SOPs approved (CLC board sign-off proxy). */
export function canApproveMinistrySop(
  user: MinistryAccessUser | UserRole | readonly UserRole[] | string,
): boolean {
  const roles = toMinistryAccessUser(user).roles;
  return (
    roles.includes('super_admin') ||
    roles.includes('admin') ||
    roles.includes('pastor')
  );
}
