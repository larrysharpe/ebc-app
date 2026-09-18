import 'server-only';

import { verifyPassword } from '@/modules/auth/utils/password.utils';
import {
  createSessionToken,
  getSessionFromCookies,
  setSessionCookie,
  clearSessionCookie,
} from '@/modules/auth/utils/session.utils';
import { findUserByEmail } from '@/modules/auth/repositories/user.repository';
import type { SessionUser } from '@/modules/auth/types/auth.types';
import type { SignInInput } from '@/modules/auth/schemas/auth.schemas';
import type { Permission } from '@/modules/auth/types/permissions.types';
import { hasPermission } from '@/modules/auth/utils/permissions.utils';

export type SignInResult =
  | { ok: true }
  | { ok: false; error: string };

export class PermissionDeniedError extends Error {
  constructor() {
    super('Forbidden');
    this.name = 'PermissionDeniedError';
  }
}

export async function signIn(input: SignInInput): Promise<SignInResult> {
  const user = await findUserByEmail(input.email.toLowerCase());

  if (!user || user.status !== 'active') {
    return { ok: false, error: 'Invalid email or password' };
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: 'Invalid email or password' };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    ministryIds: user.ministryIds,
    choirIds: user.choirIds,
  };

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await clearSessionCookie();
}

export async function getSession(): Promise<SessionUser | null> {
  return getSessionFromCookies();
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const session = await requireSession();
  if (!hasPermission(session.roles, permission)) {
    throw new PermissionDeniedError();
  }
  return session;
}
