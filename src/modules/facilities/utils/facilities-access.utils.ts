import type { UserRole } from '@/modules/auth/types/auth.types';
import { normalizeRoles } from '@/modules/auth/utils/roles.utils';

const FACILITIES_MANAGE_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'webmaster',
  'pastor',
  'office_staff',
  'trustee',
  'facility_manager',
];

export function canManageFacilities(
  roleOrRoles: UserRole | string | readonly (UserRole | string)[],
): boolean {
  const roles = normalizeRoles(roleOrRoles);
  return FACILITIES_MANAGE_ROLES.some((role) => roles.includes(role));
}
