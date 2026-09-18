import type { SessionUser, UserRole } from '@/modules/auth/types/auth.types';
import { normalizeRoles } from '@/modules/auth/utils/roles.utils';

function resolveRoles(
  user: Pick<SessionUser, 'roles'> | UserRole | readonly UserRole[] | string,
): UserRole[] {
  if (typeof user === 'string') {
    return normalizeRoles(user);
  }
  if (user && typeof user === 'object' && 'roles' in user) {
    return normalizeRoles(user.roles);
  }
  return normalizeRoles(user);
}

/** Only the webmaster role may authorize Cursor to modify the EBC APP codebase. */
export function canEditAppViaCursor(
  user: Pick<SessionUser, 'roles'> | UserRole | readonly UserRole[] | string,
): boolean {
  return resolveRoles(user).includes('webmaster');
}
