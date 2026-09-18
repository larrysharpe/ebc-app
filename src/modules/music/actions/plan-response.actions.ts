'use server';

import { revalidatePath } from 'next/cache';

import {
  createPlanCommentSchema,
  deletePlanCommentSchema,
  upsertPlanAttendanceSchema,
  type CreatePlanCommentInput,
  type DeletePlanCommentInput,
  type UpsertPlanAttendanceInput,
} from '@/modules/music/schemas/plan-response.schemas';
import {
  postPlanComment,
  removePlanComment,
  savePlanAttendance,
} from '@/modules/music/services/plan-response.service';

function revalidatePlanPaths(planId: string): void {
  revalidatePath('/music');
  revalidatePath('/music/plans');
  revalidatePath(`/music/plans/${planId}`);
  revalidatePath(`/music/plans/${planId}/rehearse`);
}

export async function upsertPlanAttendanceAction(
  input: UpsertPlanAttendanceInput,
) {
  const parsed = upsertPlanAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid attendance.',
    };
  }

  const result = await savePlanAttendance({
    ...parsed.data,
    note: parsed.data.note || undefined,
  });
  if (result.ok) revalidatePlanPaths(parsed.data.planId);
  return result;
}

export async function createPlanCommentAction(input: CreatePlanCommentInput) {
  const parsed = createPlanCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid comment.',
    };
  }

  const result = await postPlanComment(parsed.data);
  if (result.ok) revalidatePlanPaths(parsed.data.planId);
  return result;
}

export async function deletePlanCommentAction(input: DeletePlanCommentInput) {
  const parsed = deletePlanCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid request.',
    };
  }

  const result = await removePlanComment(parsed.data);
  if (result.ok) revalidatePlanPaths(result.planId);
  return result;
}
