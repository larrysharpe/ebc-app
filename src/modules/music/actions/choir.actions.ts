'use server';

import { revalidatePath } from 'next/cache';

import {
  PermissionDeniedError,
  requirePermission,
} from '@/modules/auth/services/auth.service';
import {
  choirIdSchema,
  choirInputSchema,
  choirSundayAssignmentSchema,
  type ChoirInput,
  type ChoirSundayAssignmentInput,
} from '@/modules/music/schemas/choir.schemas';
import {
  assignChoirDefaultSunday,
  countPlansForChoir,
  createChoir,
  deleteChoir,
  getChoirById,
  listChoirs,
  updateChoir,
} from '@/modules/music/repository/choir.repository';
import { isCombinedChoir, type Choir } from '@/modules/music/types/choir.types';
import { slugifyChoirName } from '@/modules/music/utils/choir.utils';

function revalidateChoirPaths(choirId?: string): void {
  revalidatePath('/music');
  revalidatePath('/music/choirs');
  revalidatePath('/music/choirs/new');
  if (choirId) revalidatePath(`/music/choirs/${choirId}`);
  revalidatePath('/music/rotation');
  revalidatePath('/music/plans');
  revalidatePath('/music/director-settings');
}

async function guardChoirManage(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    await requirePermission('music.rotation.manage');
    return { ok: true };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return { ok: false, error: 'You do not have permission to manage choirs.' };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

function uniqueChoirId(name: string, existingIds: Set<string>): string {
  const base = slugifyChoirName(name) || `choir_${Date.now()}`;
  if (!existingIds.has(base)) return base;
  let n = 2;
  while (existingIds.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

export async function saveChoirAction(
  input: ChoirInput,
): Promise<{ ok: true; choir: Choir } | { ok: false; error: string }> {
  const allowed = await guardChoirManage();
  if (!allowed.ok) return allowed;

  const parsed = choirInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid choir details.',
    };
  }

  const data = parsed.data;
  const existing = data.id ? await getChoirById(data.id) : undefined;
  const all = await listChoirs();
  const id =
    existing?.id ??
    uniqueChoirId(data.name, new Set(all.map((choir) => choir.id)));

  const nextSunday =
    data.defaultSunday === undefined
      ? (existing?.defaultSunday ?? null)
      : data.defaultSunday;

  if (isCombinedChoir(id) && nextSunday !== null) {
    return {
      ok: false,
      error: 'Combined Choir is for joint engagements and cannot own a Sunday in the rotation.',
    };
  }

  const choir: Choir = {
    id,
    name: data.name,
    leaders: data.leaders ?? existing?.leaders ?? [],
    members: data.members ?? existing?.members ?? [],
    defaultSunday: nextSunday,
    sortOrder: data.sortOrder ?? existing?.sortOrder ?? all.length + 1,
    active: data.active ?? existing?.active ?? true,
    notes: data.notes,
  };

  // Persist without Sunday first on create, then assign (clears conflicts)
  const toSave: Choir = { ...choir, defaultSunday: existing ? nextSunday : null };
  const saved = existing ? await updateChoir(toSave) : await createChoir(toSave);
  if (!saved) {
    return { ok: false, error: 'Could not save choir.' };
  }

  await assignChoirDefaultSunday(id, nextSunday);
  const refreshed = (await getChoirById(id)) ?? saved;

  revalidateChoirPaths(id);
  return { ok: true, choir: refreshed };
}

export async function deleteChoirAction(
  input: { id: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardChoirManage();
  if (!allowed.ok) return allowed;

  const parsed = choirIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid choir.' };
  }

  if (isCombinedChoir(parsed.data.id)) {
    return {
      ok: false,
      error: 'Combined Choir cannot be deleted. Mark it inactive if you need to hide it.',
    };
  }

  const planCount = await countPlansForChoir(parsed.data.id);
  if (planCount > 0) {
    return {
      ok: false,
      error: `This choir is used on ${planCount} plan(s). Reassign those plans first, or mark the choir inactive.`,
    };
  }

  const deleted = await deleteChoir(parsed.data.id);
  if (!deleted) {
    return { ok: false, error: 'Could not delete choir.' };
  }

  revalidateChoirPaths();
  return { ok: true };
}

export async function saveChoirSundayAssignmentsAction(
  input: ChoirSundayAssignmentInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardChoirManage();
  if (!allowed.ok) return allowed;

  const parsed = choirSundayAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid Sunday assignments.',
    };
  }

  const choirs = await listChoirs();
  for (const choir of choirs) {
    await assignChoirDefaultSunday(choir.id, null);
  }
  for (const row of parsed.data.assignments) {
    if (row.defaultSunday !== null) {
      if (isCombinedChoir(row.choirId)) {
        return {
          ok: false,
          error: 'Combined Choir is for joint engagements and cannot own a Sunday in the rotation.',
        };
      }
      await assignChoirDefaultSunday(row.choirId, row.defaultSunday);
    }
  }

  revalidateChoirPaths();
  return { ok: true };
}
