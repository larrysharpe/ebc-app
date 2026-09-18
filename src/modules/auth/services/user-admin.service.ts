import 'server-only';

import {
  createUserRecord,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUserRecord,
} from '@/modules/auth/repositories/user.repository';
import {
  PermissionDeniedError,
  requireSession,
} from '@/modules/auth/services/auth.service';
import type { CreateUserInput, UpdateUserInput } from '@/modules/auth/schemas/user-admin.schemas';
import type { AdminUser } from '@/modules/auth/types/user-admin.types';
import type { SessionUser } from '@/modules/auth/types/auth.types';
import { hashPassword } from '@/modules/auth/utils/password.utils';
import { choirIdsForRoles } from '@/modules/auth/utils/choir-scope.utils';
import { isPlatformAdmin } from '@/modules/auth/utils/ministry-scope.utils';
import {
  assignableRolesFor,
  canAssignRoles,
  canManageTargetUser,
  toAdminUser,
} from '@/modules/auth/utils/user-admin.utils';

export async function requirePlatformAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (!isPlatformAdmin(session.roles)) {
    throw new PermissionDeniedError();
  }
  return session;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  await requirePlatformAdmin();
  const users = await listUsers();
  return users.map(toAdminUser);
}

function ministryIdsForRoles(
  roles: CreateUserInput['roles'],
  ministryIds?: string[],
): string[] {
  return roles.includes('ministry_leader') ? (ministryIds ?? []) : [];
}

export async function createAdminUser(
  actor: SessionUser,
  input: CreateUserInput,
): Promise<{ ok: true; user: AdminUser } | { ok: false; error: string }> {
  if (!isPlatformAdmin(actor.roles)) {
    return { ok: false, error: 'You do not have permission to manage users.' };
  }
  if (!canAssignRoles(actor, input.roles)) {
    return { ok: false, error: 'You cannot assign one or more of those roles.' };
  }

  const existing = await findUserByEmail(input.email);
  if (existing) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUserRecord({
    email: input.email,
    name: input.name,
    roles: input.roles,
    ministryIds: ministryIdsForRoles(input.roles, input.ministryIds),
    choirIds: choirIdsForRoles(input.roles, input.choirIds),
    passwordHash,
    status: input.status,
  });

  return { ok: true, user: toAdminUser(user) };
}

export async function updateAdminUser(
  actor: SessionUser,
  input: UpdateUserInput,
): Promise<{ ok: true; user: AdminUser } | { ok: false; error: string }> {
  if (!isPlatformAdmin(actor.roles)) {
    return { ok: false, error: 'You do not have permission to manage users.' };
  }

  const existing = await findUserById(input.id);
  if (!existing) {
    return { ok: false, error: 'User not found.' };
  }

  if (!canManageTargetUser(actor, toAdminUser(existing))) {
    return { ok: false, error: 'You cannot modify this account.' };
  }
  if (!canAssignRoles(actor, input.roles)) {
    return { ok: false, error: 'You cannot assign one or more of those roles.' };
  }
  if (actor.id === input.id && input.status === 'disabled') {
    return { ok: false, error: 'You cannot disable your own account.' };
  }

  const passwordHash = input.password ? await hashPassword(input.password) : undefined;
  const updated = await updateUserRecord(input.id, {
    name: input.name,
    roles: input.roles,
    ministryIds: ministryIdsForRoles(input.roles, input.ministryIds),
    choirIds: choirIdsForRoles(input.roles, input.choirIds),
    passwordHash,
    status: input.status,
  });

  if (!updated) {
    return { ok: false, error: 'Could not save user.' };
  }

  return { ok: true, user: toAdminUser(updated) };
}

export function getAssignableRoles(actor: SessionUser) {
  return assignableRolesFor(actor);
}
