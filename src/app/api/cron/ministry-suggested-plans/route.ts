import { NextResponse } from 'next/server';

import { refreshChurchSuggestedPlanIfStale } from '@/modules/church/services/church-plan.service';
import {
  SUGGESTED_PLAN_CRON_BATCH_SIZE,
  SUGGESTED_PLAN_MAX_AGE_HOURS,
} from '@/modules/ministries/constants/ministry-suggested-plan.constants';
import { refreshStaleMinistrySuggestedPlans } from '@/modules/ministries/services/ministry-suggested-plan.service';

export const runtime = 'nodejs';
export const maxDuration = 300;

function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

/**
 * Hourly cron: refresh a small batch of stale ministry plans, then refresh
 * the church-wide rollup plan when it is missing or older than 24h.
 *
 * Auth: `Authorization: Bearer $CRON_SECRET`
 */
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam
    ? Math.min(20, Math.max(1, Number.parseInt(limitParam, 10) || SUGGESTED_PLAN_CRON_BATCH_SIZE))
    : SUGGESTED_PLAN_CRON_BATCH_SIZE;
  const skipChurch = url.searchParams.get('skipChurch') === '1';

  const ministries = await refreshStaleMinistrySuggestedPlans({
    maxAgeHours: SUGGESTED_PLAN_MAX_AGE_HOURS,
    limit,
  });

  const church = skipChurch
    ? ({ ok: true, skipped: true } as const)
    : await refreshChurchSuggestedPlanIfStale();

  return NextResponse.json({
    ok: true,
    ministries: {
      cursorEnabled: ministries.cursorEnabled,
      candidateCount: ministries.candidateCount,
      limit: ministries.limit,
      refreshed: ministries.refreshed.map((row) => ({
        slug: row.slug,
        ok: row.ok,
        error: row.error,
        generatedAt: row.generatedAt,
      })),
    },
    church:
      'skipped' in church && church.skipped
        ? { skipped: true }
        : {
            ok: church.ok,
            error: 'error' in church ? church.error : undefined,
            generatedAt: 'generatedAt' in church ? church.generatedAt : undefined,
          },
  });
}
