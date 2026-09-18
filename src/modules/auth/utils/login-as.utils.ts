import type { SessionUser } from '@/modules/auth/types/auth.types';
import { isSuperAdmin } from '@/modules/auth/utils/roles.utils';

/** Effective actor while impersonating (original Super Admin) or the signed-in user. */
export function getSessionActor(session: SessionUser): {
  id: string;
  email: string;
  name: string;
  roles: SessionUser['roles'];
  ministryIds: SessionUser['ministryIds'];
  choirIds: SessionUser['choirIds'];
} {
  if (session.impersonator) return session.impersonator;
  return {
    id: session.id,
    email: session.email,
    name: session.name,
    roles: session.roles,
    ministryIds: session.ministryIds,
    choirIds: session.choirIds,
  };
}

export function canLoginAsUsers(session: SessionUser): boolean {
  return isSuperAdmin(getSessionActor(session).roles);
}
