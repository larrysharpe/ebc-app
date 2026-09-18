import { getCursorConfig } from '@/lib/cursor';
import { collectCursorPromptText } from '@/modules/cursor/services/cursor-agent.service';

import {
  SUGGESTED_PLAN_CRON_BATCH_SIZE,
  SUGGESTED_PLAN_MAX_AGE_HOURS,
} from '../constants/ministry-suggested-plan.constants';
import {
  getMinistryBySlug,
  listMinistries,
  updateMinistrySuggestedPlan,
} from '../repositories/ministry.repository';
import type { Ministry } from '../types';
import {
  buildMinistryPlanPrompt,
  buildMinistryPlanSignals,
} from '../utils/ministry-plan.utils';
import {
  isSuggestedPlanStale,
  sortMinistriesForSuggestedPlanRefresh,
} from '../utils/ministry-suggested-plan.utils';

export type SuggestedPlanRefreshResult = {
  slug: string;
  ok: boolean;
  error?: string;
  generatedAt?: string;
  suggestedPlan?: string;
};

export type SuggestedPlanBatchResult = {
  cursorEnabled: boolean;
  refreshed: SuggestedPlanRefreshResult[];
  candidateCount: number;
  limit: number;
};

export async function refreshMinistrySuggestedPlan(
  ministry: Ministry,
): Promise<SuggestedPlanRefreshResult> {
  const { enabled } = getCursorConfig();
  if (!enabled) {
    return {
      slug: ministry.slug,
      ok: false,
      error: 'Cursor is not configured. Add CURSOR_API_KEY to enable suggested plans.',
    };
  }

  const signals = buildMinistryPlanSignals(ministry);
  const prompt = buildMinistryPlanPrompt({ ministry, signals });

  try {
    const text = await collectCursorPromptText({
      prompt,
      purpose: 'ministry-plan-help',
      pagePath: `/ministries/${ministry.slug}`,
      pageTitle: `Plan · ${ministry.name}`,
      allowWrites: false,
    });

    if (!text) {
      return {
        slug: ministry.slug,
        ok: false,
        error: 'AI returned an empty plan.',
      };
    }

    const generatedAt = new Date();
    await updateMinistrySuggestedPlan(ministry.id, text, generatedAt);

    return {
      slug: ministry.slug,
      ok: true,
      generatedAt: generatedAt.toISOString(),
      suggestedPlan: text,
    };
  } catch (error) {
    return {
      slug: ministry.slug,
      ok: false,
      error: error instanceof Error ? error.message : 'Suggested plan refresh failed.',
    };
  }
}

export async function refreshMinistrySuggestedPlanBySlug(
  slug: string,
): Promise<SuggestedPlanRefreshResult> {
  const ministry = await getMinistryBySlug(slug);
  if (!ministry) {
    return { slug, ok: false, error: 'Ministry not found.' };
  }
  return refreshMinistrySuggestedPlan(ministry);
}

/**
 * Refresh ministries whose cached plan is missing or older than maxAgeHours.
 * Processes at most `limit` ministries (sequential) for serverless time budgets.
 */
export async function refreshStaleMinistrySuggestedPlans(options?: {
  maxAgeHours?: number;
  limit?: number;
  now?: Date;
}): Promise<SuggestedPlanBatchResult> {
  const maxAgeHours = options?.maxAgeHours ?? SUGGESTED_PLAN_MAX_AGE_HOURS;
  const limit = options?.limit ?? SUGGESTED_PLAN_CRON_BATCH_SIZE;
  const now = options?.now ?? new Date();

  const { enabled } = getCursorConfig();
  if (!enabled) {
    return {
      cursorEnabled: false,
      refreshed: [],
      candidateCount: 0,
      limit,
    };
  }

  const ministries = await listMinistries();
  const stale = sortMinistriesForSuggestedPlanRefresh(
    ministries.filter((ministry) =>
      isSuggestedPlanStale(ministry.suggestedPlanGeneratedAt, maxAgeHours, now),
    ),
  );

  const batch = stale.slice(0, Math.max(0, limit));
  const refreshed: SuggestedPlanRefreshResult[] = [];

  for (const ministry of batch) {
    refreshed.push(await refreshMinistrySuggestedPlan(ministry));
  }

  return {
    cursorEnabled: true,
    refreshed,
    candidateCount: stale.length,
    limit,
  };
}
