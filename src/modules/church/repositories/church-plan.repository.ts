import { prisma } from '@/lib/db';

import { CHURCH_PLAN_ID } from '../constants/church-plan.constants';
import type { ChurchPlanRecord } from '../types/church-plan.types';

export async function getChurchPlan(): Promise<ChurchPlanRecord> {
  const row = await prisma.churchPlan.findUnique({ where: { id: CHURCH_PLAN_ID } });
  if (!row) return {};
  return {
    suggestedPlan: row.suggestedPlan ?? undefined,
    suggestedPlanGeneratedAt: row.suggestedPlanGeneratedAt
      ? row.suggestedPlanGeneratedAt.toISOString()
      : undefined,
  };
}

export async function upsertChurchSuggestedPlan(
  suggestedPlan: string,
  generatedAt: Date = new Date(),
): Promise<ChurchPlanRecord> {
  const row = await prisma.churchPlan.upsert({
    where: { id: CHURCH_PLAN_ID },
    create: {
      id: CHURCH_PLAN_ID,
      suggestedPlan,
      suggestedPlanGeneratedAt: generatedAt,
    },
    update: {
      suggestedPlan,
      suggestedPlanGeneratedAt: generatedAt,
    },
  });

  return {
    suggestedPlan: row.suggestedPlan ?? undefined,
    suggestedPlanGeneratedAt: row.suggestedPlanGeneratedAt
      ? row.suggestedPlanGeneratedAt.toISOString()
      : undefined,
  };
}
