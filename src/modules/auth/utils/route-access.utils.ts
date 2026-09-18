import { ROUTE_ACCESS } from '@/modules/auth/constants/auth.constants';
import { isGlobalChurchRoute } from '@/modules/auth/constants/church-routes.constants';
import type { SessionUser, StoredUserRole } from '@/modules/auth/types/auth.types';
import {
  canAccessMinistrySlug,
  isPlatformAdmin,
} from '@/modules/auth/utils/ministry-scope.utils';
import {
  canAccessRoutePermission,
  hasPermission,
} from '@/modules/auth/utils/permissions.utils';
import { normalizeRoles } from '@/modules/auth/utils/roles.utils';
import type { Permission } from '@/modules/auth/types/permissions.types';

export type RouteAccessUser = Pick<SessionUser, 'roles' | 'ministryIds'>;

function toAccessUser(
  user: RouteAccessUser | StoredUserRole | string | readonly StoredUserRole[],
): RouteAccessUser {
  if (typeof user === 'string' || !('roles' in user)) {
    return { roles: normalizeRoles(user), ministryIds: [] };
  }
  return {
    roles: normalizeRoles(user.roles),
    ministryIds: user.ministryIds ?? [],
  };
}

function matchesMinistryDetailPath(pathname: string): string | null {
  const match = pathname.match(/^\/ministries\/([^/]+)(?:\/|$)/);
  return match?.[1] ?? null;
}

import type { UserRole } from '@/modules/auth/types/auth.types';

function canAccessRouteForRole(role: UserRole, pathname: string): boolean {
  const sortedPrefixes = Object.keys(ROUTE_ACCESS).sort(
    (a, b) => b.length - a.length,
  );

  for (const prefix of sortedPrefixes) {
    const matches =
      pathname === prefix || (prefix !== '/' && pathname.startsWith(`${prefix}/`));
    if (!matches) continue;
    if (!ROUTE_ACCESS[prefix]?.includes(role)) return false;
    return canAccessRoutePermission(role, pathname);
  }

  return false;
}

export function canAccessRoute(
  user: RouteAccessUser | StoredUserRole | string | readonly StoredUserRole[],
  pathname: string,
): boolean {
  if (isGlobalChurchRoute(pathname)) return true;

  const accessUser = toAccessUser(user);

  if (isPlatformAdmin(accessUser.roles)) return true;

  const ministrySlug = matchesMinistryDetailPath(pathname);
  if (ministrySlug && !canAccessMinistrySlug(accessUser, ministrySlug)) {
    return false;
  }

  return accessUser.roles.some((role) => canAccessRouteForRole(role, pathname));
}

export function canPerform(
  roleOrRoles: StoredUserRole | string | readonly StoredUserRole[],
  permission: Permission,
): boolean {
  return hasPermission(roleOrRoles, permission);
}
