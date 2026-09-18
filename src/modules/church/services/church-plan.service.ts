import { getCursorConfig } from '@/lib/cursor';
import { collectCursorPromptText } from '@/modules/cursor/services/cursor-agent.service';
import {
  buildMinistryPlanSignals,
  isSuggestedPlanStale,
  listMinistries,
} from '@/modules/ministries';

import { CHURCH_PLAN_MAX_AGE_HOURS } from '../constants/church-plan.constants';
import {
  getChurchPlan,
  upsertChurchSuggestedPlan,
} from '../repositories/church-plan.repository';
import type {
  ChurchPlanViewModel,
  MinistryPlanRollupEntry,
} from '../types/church-plan.types';
import {
  buildChurchPlanPrompt,
  buildMinistryPlanRollupEntry,
} from '../utils/church-plan.utils';

export type ChurchPlanRefreshResult = {
  ok: boolean;
  error?: string;
  suggestedPlan?: string;
  generatedAt?: string;
};

export async function buildMinistryPlanRollup(): Promise<MinistryPlanRollupEntry[]> {
  const ministries = await listMinistries();
  return ministries.map((ministry) =>
    buildMinistryPlanRollupEntry(ministry, buildMinistryPlanSignals(ministry)),
  );
}

export async function getChurchPlanViewModel(): Promise<ChurchPlanViewModel> {
  const [plan, rollup] = await Promise.all([getChurchPlan(), buildMinistryPlanRollup()]);
  return {
    plan,
    rollup,
    urgentCount: rollup.reduce((count, entry) => count + entry.urgentSignals.length, 0),
    ministriesWithPlan: rollup.filter((entry) => entry.planExcerpt).length,
  };
}

export async function refreshChurchSuggestedPlan(): Promise<ChurchPlanRefreshResult> {
  const { enabled } = getCursorConfig();
  if (!enabled) {
    return {
      ok: false,
      error: 'Cursor is not configured. Add CURSOR_API_KEY to enable the church plan.',
    };
  }

  const rollup = await buildMinistryPlanRollup();
  const prompt = buildChurchPlanPrompt(rollup);

  try {
    const text = await collectCursorPromptText({
      prompt,
      purpose: 'church-plan-help',
      pagePath: '/church/plan',
      pageTitle: 'Church plan',
      allowWrites: false,
    });

    if (!text) {
      return { ok: false, error: 'AI returned an empty church plan.' };
    }

    const generatedAt = new Date();
    const saved = await upsertChurchSuggestedPlan(text, generatedAt);
    return {
      ok: true,
      suggestedPlan: saved.suggestedPlan,
      generatedAt: saved.suggestedPlanGeneratedAt,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Church plan refresh failed.',
    };
  }
}

/** Refresh when missing or stale (used by cron after ministry batch). */
export async function refreshChurchSuggestedPlanIfStale(options?: {
  maxAgeHours?: number;
  now?: Date;
}): Promise<ChurchPlanRefreshResult | { ok: true; skipped: true }> {
  const maxAgeHours = options?.maxAgeHours ?? CHURCH_PLAN_MAX_AGE_HOURS;
  const now = options?.now ?? new Date();
  const current = await getChurchPlan();

  if (!isSuggestedPlanStale(current.suggestedPlanGeneratedAt, maxAgeHours, now)) {
    return { ok: true, skipped: true };
  }

  return refreshChurchSuggestedPlan();
}
