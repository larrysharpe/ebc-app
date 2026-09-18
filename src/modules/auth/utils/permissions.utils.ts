import {
  BAND_ROLE_HIERARCHY,
  CHOIR_ROLE_HIERARCHY,
  PERMISSIONS,
  ROUTE_PERMISSIONS,
} from '@/modules/auth/constants/permissions.constants';
import type { PermissionHierarchy } from '@/modules/auth/types/permissions.types';
import type { Permission, MusicAccess } from '@/modules/auth/types/permissions.types';
import type { StoredUserRole, UserRole } from '@/modules/auth/types/auth.types';
import { normalizeRoles } from '@/modules/auth/utils/roles.utils';

const HIERARCHIES = {
  choir: CHOIR_ROLE_HIERARCHY,
  band: BAND_ROLE_HIERARCHY,
} as const;

/** Map legacy role strings to the current hierarchy roles. */
export function normalizeRole(role: StoredUserRole | string): UserRole {
  switch (role) {
    case 'music_director':
      return 'music_minister';
    case 'musician':
      return 'band_member';
    default:
      return role as UserRole;
  }
}

function getHierarchyRank(
  role: UserRole,
  hierarchy: PermissionHierarchy,
): number | null {
  const chain = HIERARCHIES[hierarchy] as readonly string[];
  const index = chain.indexOf(role);
  return index >= 0 ? index : null;
}

function meetsHierarchyRequirement(
  role: UserRole,
  hierarchy: PermissionHierarchy,
  minRole: string,
): boolean {
  const userRank = getHierarchyRank(role, hierarchy);
  const minRank = getHierarchyRank(minRole as UserRole, hierarchy);
  if (userRank === null || minRank === null) return false;
  return userRank >= minRank;
}

function isMusicBranchRole(role: UserRole): boolean {
  return (
    getHierarchyRank(role, 'choir') !== null ||
    getHierarchyRank(role, 'band') !== null
  );
}

function hasPermissionForRole(role: UserRole, permission: Permission): boolean {
  if (role === 'super_admin' || role === 'admin') return true;

  const rule = PERMISSIONS[permission];

  if (rule.kind === 'hierarchy') {
    return meetsHierarchyRequirement(role, rule.hierarchy, rule.minRole);
  }

  if (rule.kind === 'music_any') {
    return role === 'pastor' || isMusicBranchRole(role);
  }

  return false;
}

export function hasPermission(
  roleOrRoles: StoredUserRole | string | readonly (StoredUserRole | string)[],
  permission: Permission,
): boolean {
  return normalizeRoles(roleOrRoles).some((role) => hasPermissionForRole(role, permission));
}

export function getMusicAccess(
  roleOrRoles: StoredUserRole | string | readonly (StoredUserRole | string)[],
): MusicAccess {
  return {
    canView: hasPermission(roleOrRoles, 'music.view'),
    canViewPlans: hasPermission(roleOrRoles, 'music.plans.view'),
    canEditPlans: hasPermission(roleOrRoles, 'music.plans.edit'),
    canPickSongs: hasPermission(roleOrRoles, 'music.songs.pick'),
    canRequestSongs: hasPermission(roleOrRoles, 'music.songs.request'),
    canManageSongs: hasPermission(roleOrRoles, 'music.songs.manage'),
    canSendPlans: hasPermission(roleOrRoles, 'music.plans.send'),
    canViewBand: hasPermission(roleOrRoles, 'music.band.view'),
    canManageBand: hasPermission(roleOrRoles, 'music.band.manage'),
    canManageRotation: hasPermission(roleOrRoles, 'music.rotation.manage'),
    canManagePeople: hasPermission(roleOrRoles, 'music.people.manage'),
    canManageIntake: hasPermission(roleOrRoles, 'music.intake.manage'),
  };
}

export function canAccessRoutePermission(
  roleOrRoles: StoredUserRole | string | readonly (StoredUserRole | string)[],
  pathname: string,
): boolean {
  const roles = normalizeRoles(roleOrRoles);
  const sortedPaths = Object.keys(ROUTE_PERMISSIONS).sort(
    (a, b) => b.length - a.length,
  );

  for (const path of sortedPaths) {
    const matches =
      pathname === path || (path !== '/' && pathname.startsWith(`${path}/`));
    if (!matches) continue;

    const permission = ROUTE_PERMISSIONS[path];
    if (!permission) return true;
    return roles.some((role) => hasPermissionForRole(role, permission));
  }

  return true;
}
