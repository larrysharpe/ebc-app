import type { UserRole } from '@/modules/auth/types/auth.types';
import { normalizeRoles } from '@/modules/auth/utils/roles.utils';

const MANAGE_ROLES: readonly UserRole[] = [
  'super_admin',
  'admin',
  'webmaster',
  'pastor',
  'office_staff',
];

export function canManageSundayServices(
  roleOrRoles: UserRole | string | readonly (UserRole | string)[],
): boolean {
  return normalizeRoles(roleOrRoles).some((role) => MANAGE_ROLES.includes(role));
}
