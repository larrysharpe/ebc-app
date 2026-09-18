'use server';

import { revalidatePath } from 'next/cache';

import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/modules/auth/schemas/user-admin.schemas';
import {
  PermissionDeniedError,
  getSession,
} from '@/modules/auth/services/auth.service';
import {
  createAdminUser,
  getAssignableRoles,
  listAdminUsers,
  requirePlatformAdmin,
  updateAdminUser,
} from '@/modules/auth/services/user-admin.service';

function revalidateSettingsPaths(): void {
  revalidatePath('/settings');
  revalidatePath('/settings/users');
}

export async function listUsersAction() {
  try {
    const users = await listAdminUsers();
    return { ok: true as const, users };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return { ok: false as const, error: 'You do not have permission to view users.' };
    }
    return { ok: false as const, error: 'You must be signed in.' };
  }
}

export async function saveUserAction(
  input: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const isUpdate = typeof input.id === 'string' && input.id.length > 0;

  if (isUpdate) {
    const parsed = updateUserSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }
    const result = await updateAdminUser(session, parsed.data);
    if (!result.ok) return result;
  } else {
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }
    const result = await createAdminUser(session, parsed.data);
    if (!result.ok) return result;
  }

  revalidateSettingsPaths();
  return { ok: true };
}

export async function getUserAdminMetaAction() {
  try {
    const session = await requirePlatformAdmin();
    return {
      ok: true as const,
      assignableRoles: getAssignableRoles(session),
      actorRoles: session.roles,
    };
  } catch {
    return { ok: false as const, error: 'Forbidden' };
  }
}
