import { randomUUID } from 'crypto';

import { prisma } from '@/lib/db';
import { findUserById } from '@/modules/auth/repositories/user.repository';

import type {
  PlanAttendance,
  PlanAttendanceStatus,
  PlanComment,
} from '../types/plan-response.types';
import { isPlanAttendanceStatus } from '../utils/plan-response.utils';

function mapAttendance(
  row: {
    id: string;
    planId: string;
    userId: string;
    personId: string | null;
    status: string;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  displayName: string,
): PlanAttendance {
  const status = isPlanAttendanceStatus(row.status)
    ? row.status
    : 'maybe';
  return {
    id: row.id,
    planId: row.planId,
    userId: row.userId,
    personId: row.personId ?? undefined,
    status,
    note: row.note ?? undefined,
    displayName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapComment(row: {
  id: string;
  planId: string;
  userId: string;
  personId: string | null;
  authorName: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}): PlanComment {
  return {
    id: row.id,
    planId: row.planId,
    userId: row.userId,
    personId: row.personId ?? undefined,
    authorName: row.authorName,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function displayNameForUser(userId: string): Promise<string> {
  const user = await findUserById(userId);
  return user?.name?.trim() || 'Choir member';
}

export async function listPlanAttendance(
  planId: string,
): Promise<PlanAttendance[]> {
  const rows = await prisma.planAttendance.findMany({
    where: { planId },
    orderBy: [{ updatedAt: 'desc' }],
  });
  return Promise.all(
    rows.map(async (row) =>
      mapAttendance(row, await displayNameForUser(row.userId)),
    ),
  );
}

export async function getPlanAttendanceForUser(
  planId: string,
  userId: string,
): Promise<PlanAttendance | null> {
  const row = await prisma.planAttendance.findUnique({
    where: { planId_userId: { planId, userId } },
  });
  if (!row) return null;
  return mapAttendance(row, await displayNameForUser(row.userId));
}

export async function upsertPlanAttendance(input: {
  planId: string;
  userId: string;
  personId?: string | null;
  status: PlanAttendanceStatus;
  note?: string | null;
}): Promise<PlanAttendance> {
  const row = await prisma.planAttendance.upsert({
    where: {
      planId_userId: { planId: input.planId, userId: input.userId },
    },
    create: {
      id: randomUUID(),
      planId: input.planId,
      userId: input.userId,
      personId: input.personId ?? null,
      status: input.status,
      note: input.note?.trim() || null,
    },
    update: {
      status: input.status,
      note: input.note?.trim() || null,
      personId: input.personId ?? null,
    },
  });
  return mapAttendance(row, await displayNameForUser(row.userId));
}

export async function listPlanComments(planId: string): Promise<PlanComment[]> {
  const rows = await prisma.planComment.findMany({
    where: { planId },
    orderBy: [{ createdAt: 'asc' }],
  });
  return rows.map(mapComment);
}

export async function createPlanComment(input: {
  planId: string;
  userId: string;
  personId?: string | null;
  authorName: string;
  body: string;
}): Promise<PlanComment> {
  const row = await prisma.planComment.create({
    data: {
      id: randomUUID(),
      planId: input.planId,
      userId: input.userId,
      personId: input.personId ?? null,
      authorName: input.authorName.trim(),
      body: input.body.trim(),
    },
  });
  return mapComment(row);
}

export async function getPlanCommentById(
  id: string,
): Promise<PlanComment | null> {
  const row = await prisma.planComment.findUnique({ where: { id } });
  return row ? mapComment(row) : null;
}

export async function deletePlanComment(id: string): Promise<boolean> {
  try {
    await prisma.planComment.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
