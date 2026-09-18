import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from '@/modules/auth/constants/auth.constants';
import type {
  SessionImpersonator,
  SessionUser,
  UserRole,
} from '@/modules/auth/types/auth.types';
import { normalizeRoles } from '@/modules/auth/utils/roles.utils';

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  roles: readonly UserRole[];
  ministryIds: readonly string[];
  choirIds: readonly string[];
  impersonator?: SessionImpersonator;
};

function parseRoles(payload: Record<string, unknown>): UserRole[] {
  if (Array.isArray(payload.roles)) {
    return normalizeRoles(payload.roles.filter((role): role is string => typeof role === 'string'));
  }
  if (typeof payload.role === 'string') {
    return normalizeRoles(payload.role);
  }
  return [];
}

function parseStringIdArray(
  payload: Record<string, unknown>,
  pluralKey: string,
  singularKey: string,
): string[] {
  const plural = payload[pluralKey];
  if (Array.isArray(plural)) {
    return plural.filter((id): id is string => typeof id === 'string');
  }
  const singular = payload[singularKey];
  if (typeof singular === 'string') {
    return [singular];
  }
  return [];
}

function parseMinistryIds(payload: Record<string, unknown>): string[] {
  return parseStringIdArray(payload, 'ministryIds', 'ministryId');
}

function parseChoirIds(payload: Record<string, unknown>): string[] {
  return parseStringIdArray(payload, 'choirIds', 'choirId');
}

function parseImpersonator(payload: Record<string, unknown>): SessionImpersonator | undefined {
  const raw = payload.impersonator;
  if (!raw || typeof raw !== 'object') return undefined;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== 'string' || typeof row.email !== 'string' || typeof row.name !== 'string') {
    return undefined;
  }
  const roles = parseRoles(row);
  if (roles.length === 0) return undefined;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    roles,
    ministryIds: parseMinistryIds(row),
    choirIds: parseChoirIds(row),
  };
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set (32+ characters)');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const claims: Omit<SessionPayload, 'sub'> = {
    email: user.email,
    name: user.name,
    roles: user.roles,
    ministryIds: user.ministryIds,
    choirIds: user.choirIds,
  };
  if (user.impersonator) {
    claims.impersonator = user.impersonator;
  }

  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function readSessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    if (!sub || typeof sub !== 'string') return null;

    const email = payload.email;
    const name = payload.name;
    const roles = parseRoles(payload as Record<string, unknown>);
    const ministryIds = parseMinistryIds(payload as Record<string, unknown>);
    const choirIds = parseChoirIds(payload as Record<string, unknown>);
    const impersonator = parseImpersonator(payload as Record<string, unknown>);

    if (typeof email !== 'string' || typeof name !== 'string' || roles.length === 0) {
      return null;
    }

    const session: SessionUser = {
      id: sub,
      email,
      name,
      roles,
      ministryIds,
      choirIds,
    };
    if (impersonator) {
      session.impersonator = impersonator;
    }
    return session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}
