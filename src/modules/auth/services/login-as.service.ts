import 'server-only';

import {
  findUserByEmail,
  findUserById,
} from '@/modules/auth/repositories/user.repository';
import { getSession } from '@/modules/auth/services/auth.service';
import type {
  AuthUserRecord,
  SessionImpersonator,
  SessionUser,
} from '@/modules/auth/types/auth.types';
import { isDevAuthEnabled } from '@/modules/auth/utils/dev-auth.utils';
import {
  canLoginAsUsers,
  getSessionActor,
} from '@/modules/auth/utils/login-as.utils';
import {
  createSessionToken,
  setSessionCookie,
} from '@/modules/auth/utils/session.utils';

function toSessionUser(
  user: AuthUserRecord,
  impersonator?: SessionImpersonator,
): SessionUser {
  const session: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    ministryIds: user.ministryIds,
    choirIds: user.choirIds,
  };
  if (impersonator) {
    session.impersonator = impersonator;
  }
  return session;
}

export async function establishSession(user: SessionUser): Promise<SessionUser> {
  const token = await createSessionToken(user);
  await setSessionCookie(token);
  return user;
}

/**
 * Super Admin: open the app as another active account (with return path).
 */
export async function loginAsUser(
  targetUserId: string,
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }
  if (!canLoginAsUsers(session)) {
    return { ok: false, error: 'Only Super Admin can log in as another user.' };
  }

  const actor: SessionImpersonator = getSessionActor(session);
  if (targetUserId === session.id || targetUserId === actor.id) {
    return { ok: false, error: 'You are already signed in as that user.' };
  }

  const target = await findUserById(targetUserId);
  if (!target || target.status !== 'active') {
    return { ok: false, error: 'That account was not found or is inactive.' };
  }

  const next = toSessionUser(target, actor);
  await establishSession(next);
  return { ok: true, user: next };
}

/** Restore the Super Admin session after login-as. */
export async function stopImpersonating(): Promise<
  { ok: true; user: SessionUser } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }
  if (!session.impersonator) {
    return { ok: false, error: 'You are not viewing as another user.' };
  }

  const actor = await findUserById(session.impersonator.id);
  if (!actor || actor.status !== 'active') {
    return {
      ok: false,
      error: 'Your original account is unavailable. Sign in again.',
    };
  }

  const next = toSessionUser(actor);
  await establishSession(next);
  return { ok: true, user: next };
}

/** Dev-only passwordless sign-in (full identity replace, no impersonator). */
export async function signInAsDevUser(
  email: string,
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  if (!isDevAuthEnabled()) {
    return { ok: false, error: 'Dev sign-in is not available.' };
  }

  const user = await findUserByEmail(email.toLowerCase());
  if (!user || user.status !== 'active') {
    return { ok: false, error: 'Dev account not found. Run npm run db:seed.' };
  }

  const next = toSessionUser(user);
  await establishSession(next);
  return { ok: true, user: next };
}
