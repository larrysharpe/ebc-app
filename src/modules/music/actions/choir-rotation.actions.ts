'use server';

import { revalidatePath } from 'next/cache';

import {
  PermissionDeniedError,
  requirePermission,
} from '@/modules/auth/services/auth.service';
import {
  scheduleOverrideIdSchema,
  scheduleOverrideInputSchema,
  type ScheduleOverrideInput,
} from '@/modules/music/schemas/choir-rotation.schemas';
import {
  createScheduleOverride,
  deleteScheduleOverride,
  getScheduleOverrideById,
  updateScheduleOverride,
} from '@/modules/music/repository/choir-rotation.repository';
import type { ChoirScheduleOverride } from '@/modules/music/types';
import { getSundayOfMonth } from '@/modules/music/utils/choir-schedule.utils';

function revalidateRotationPaths(): void {
  revalidatePath('/music');
  revalidatePath('/music/choirs');
  revalidatePath('/music/rotation');
  revalidatePath('/music/plans');
}

async function guardRotationManage(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    await requirePermission('music.rotation.manage');
    return { ok: true };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return {
        ok: false,
        error: 'You do not have permission to manage choir rotation.',
      };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

export async function saveScheduleOverrideAction(
  input: ScheduleOverrideInput,
): Promise<
  { ok: true; override: ChoirScheduleOverride } | { ok: false; error: string }
> {
  const allowed = await guardRotationManage();
  if (!allowed.ok) return allowed;

  const parsed = scheduleOverrideInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid schedule swap.',
    };
  }

  const sundayOfMonth = getSundayOfMonth(parsed.data.serviceDate);
  if (!sundayOfMonth) {
    return { ok: false, error: 'Schedule swaps must be on a Sunday.' };
  }

  const override: ChoirScheduleOverride = {
    id: parsed.data.id ?? `override-${Date.now()}`,
    serviceDate: parsed.data.serviceDate,
    choirGroup: parsed.data.choirGroup,
    sundayOfMonth,
    note: parsed.data.note,
  };

  const existing = parsed.data.id
    ? await getScheduleOverrideById(parsed.data.id)
    : undefined;

  const saved = existing
    ? await updateScheduleOverride(override)
    : await createScheduleOverride(override);

  if (!saved) {
    return { ok: false, error: 'Could not save schedule swap.' };
  }

  revalidateRotationPaths();
  return { ok: true, override: saved };
}

export async function deleteScheduleOverrideAction(
  input: { id: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardRotationManage();
  if (!allowed.ok) return allowed;

  const parsed = scheduleOverrideIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid schedule swap.' };
  }

  const deleted = await deleteScheduleOverride(parsed.data.id);
  if (!deleted) {
    return { ok: false, error: 'Could not remove schedule swap.' };
  }

  revalidateRotationPaths();
  return { ok: true };
}
