import 'server-only';

import {
  PermissionDeniedError,
  requirePermission,
  requireSession,
} from '@/modules/auth/services/auth.service';
import { getPersonByEmail } from '@/modules/members/repositories/person.repository';
import { notify } from '@/modules/notifications';
import { getPlanById } from '@/modules/music/repository/music.repository';
import {
  createPlanComment,
  deletePlanComment,
  getPlanAttendanceForUser,
  getPlanCommentById,
  listPlanAttendance,
  listPlanComments,
  upsertPlanAttendance,
} from '@/modules/music/repository/plan-response.repository';
import type {
  CreatePlanCommentInput,
  DeletePlanCommentInput,
  UpsertPlanAttendanceInput,
} from '@/modules/music/schemas/plan-response.schemas';
import type {
  PlanAttendance,
  PlanComment,
  PlanResponseBoard,
} from '@/modules/music/types/plan-response.types';
import { PLAN_ATTENDANCE_STATUS_LABELS } from '@/modules/music/types/plan-response.types';
import { listMusicLeaderNotifyUserIds } from '@/modules/music/utils/plan-notify-audience.utils';
import { summarizePlanAttendance } from '@/modules/music/utils/plan-response.utils';

export type { PlanResponseBoard };

async function requirePlanView() {
  return requirePermission('music.plans.view');
}

function authError(error: unknown): { ok: false; error: string } | null {
  if (error instanceof PermissionDeniedError) {
    return {
      ok: false,
      error: 'You do not have permission to respond to this plan.',
    };
  }
  return null;
}

async function requireSentPlan(planId: string) {
  const plan = await getPlanById(planId);
  if (!plan) {
    return { ok: false as const, error: 'Plan not found.', plan: null };
  }
  if (plan.status !== 'sent') {
    return {
      ok: false as const,
      error: 'Attendance and comments open after the plan is sent.',
      plan: null,
    };
  }
  return { ok: true as const, plan };
}

export async function getPlanResponseBoard(
  planId: string,
): Promise<PlanResponseBoard> {
  await requirePlanView();
  const session = await requireSession();
  const [attendance, comments, myAttendance] = await Promise.all([
    listPlanAttendance(planId),
    listPlanComments(planId),
    getPlanAttendanceForUser(planId, session.id),
  ]);
  return {
    attendance,
    comments,
    summary: summarizePlanAttendance(attendance),
    myAttendance,
  };
}

export async function savePlanAttendance(
  input: UpsertPlanAttendanceInput,
): Promise<{ ok: true; attendance: PlanAttendance } | { ok: false; error: string }> {
  try {
    await requirePlanView();
  } catch (error) {
    return authError(error) ?? { ok: false, error: 'You must be signed in.' };
  }

  const session = await requireSession();
  const sent = await requireSentPlan(input.planId);
  if (!sent.ok) return { ok: false, error: sent.error };

  const person = await getPersonByEmail(session.email);
  const attendance = await upsertPlanAttendance({
    planId: input.planId,
    userId: session.id,
    personId: person?.id,
    status: input.status,
    note: input.note?.trim() || null,
  });

  const leaders = await listMusicLeaderNotifyUserIds(session.id);
  await notify({
    topic: 'music.attendance.received',
    actorUserId: session.id,
    recipientUserIds: leaders,
    title: `Attendance update: ${sent.plan.title}`,
    body: `${session.name} answered “${PLAN_ATTENDANCE_STATUS_LABELS[input.status]}” for ${sent.plan.title}.`,
    href: `/music/plans/${sent.plan.id}`,
    payload: { planId: sent.plan.id },
  });

  return { ok: true, attendance };
}

export async function postPlanComment(
  input: CreatePlanCommentInput,
): Promise<{ ok: true; comment: PlanComment } | { ok: false; error: string }> {
  try {
    await requirePlanView();
  } catch (error) {
    return authError(error) ?? { ok: false, error: 'You must be signed in.' };
  }

  const session = await requireSession();
  const sent = await requireSentPlan(input.planId);
  if (!sent.ok) return { ok: false, error: sent.error };

  const person = await getPersonByEmail(session.email);
  const comment = await createPlanComment({
    planId: input.planId,
    userId: session.id,
    personId: person?.id,
    authorName: session.name,
    body: input.body,
  });

  const leaders = await listMusicLeaderNotifyUserIds(session.id);
  await notify({
    topic: 'music.comment.posted',
    actorUserId: session.id,
    recipientUserIds: leaders,
    title: `New comment on ${sent.plan.title}`,
    body: `${session.name} commented on the choir plan. Open the Comments tab to read it.`,
    href: `/music/plans/${sent.plan.id}#comments`,
    payload: { planId: sent.plan.id, commentId: comment.id },
  });

  return { ok: true, comment };
}

export async function removePlanComment(
  input: DeletePlanCommentInput,
): Promise<{ ok: true; planId: string } | { ok: false; error: string }> {
  try {
    await requirePlanView();
  } catch (error) {
    return authError(error) ?? { ok: false, error: 'You must be signed in.' };
  }

  const session = await requireSession();
  const existing = await getPlanCommentById(input.id);
  if (!existing) {
    return { ok: false, error: 'Comment not found.' };
  }

  const canDelete =
    existing.userId === session.id ||
    session.roles.includes('music_minister') ||
    session.roles.includes('choir_director') ||
    session.roles.includes('super_admin') ||
    session.roles.includes('admin');

  if (!canDelete) {
    return { ok: false, error: 'You can only delete your own comments.' };
  }

  const deleted = await deletePlanComment(input.id);
  if (!deleted) {
    return { ok: false, error: 'Could not delete the comment.' };
  }
  return { ok: true, planId: existing.planId };
}
