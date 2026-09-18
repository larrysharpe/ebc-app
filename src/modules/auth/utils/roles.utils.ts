import type { StoredUserRole, UserRole } from '@/modules/auth/types/auth.types';
import { normalizeRole } from '@/modules/auth/utils/permissions.utils';

export function normalizeRoles(
  input: StoredUserRole | string | readonly (StoredUserRole | string)[],
): UserRole[] {
  const values = Array.isArray(input) ? input : [input];
  const roles = values.map((role) => normalizeRole(role));
  return [...new Set(roles)];
}

export function hasRole(roles: readonly UserRole[], role: UserRole): boolean {
  return roles.includes(role);
}

export function hasAnyRole(
  roles: readonly UserRole[],
  candidates: readonly UserRole[],
): boolean {
  return candidates.some((role) => roles.includes(role));
}

export function isSuperAdmin(roles: readonly UserRole[]): boolean {
  return roles.includes('super_admin');
}

export function isAdminRole(roles: readonly UserRole[]): boolean {
  return roles.includes('admin');
}
