import { getCursorConfig } from '@/lib/cursor';
import { collectCursorPromptText } from '@/modules/cursor/services/cursor-agent.service';

import { getPlans, getSongs } from '../repository/music.repository';
import type { ServiceMusicPlan } from '../types';
import { buildRepertoireCoachPrompt } from '../utils/repertoire-coach.utils';
import { buildRepertoireSnapshot } from '../utils/repertoire.utils';

export type RepertoireCoachServiceResult =
  | { ok: true; guidance: string; generatedAt: string }
  | { ok: false; error: string };

function upcomingPlans(plans: ServiceMusicPlan[], now: Date): ServiceMusicPlan[] {
  const today = now.toISOString().slice(0, 10);
  return plans
    .filter((plan) => plan.serviceDate >= today)
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate))
    .slice(0, 6);
}

export async function generateRepertoireCoachGuidance(
  now: Date = new Date(),
): Promise<RepertoireCoachServiceResult> {
  const { enabled } = getCursorConfig();
  if (!enabled) {
    return {
      ok: false,
      error: 'Cursor is not configured. Add CURSOR_API_KEY to enable repertoire coaching.',
    };
  }

  const [songs, plans] = await Promise.all([getSongs(), getPlans()]);
  const snapshot = buildRepertoireSnapshot(songs, plans, now);
  const drafts = plans.filter((plan) => plan.status === 'draft');
  const prompt = buildRepertoireCoachPrompt({
    snapshot,
    upcomingPlans: upcomingPlans(plans, now),
    draftCount: drafts.length,
    now,
  });

  try {
    const text = await collectCursorPromptText({
      prompt,
      purpose: 'repertoire-coach-help',
      pagePath: '/music',
      pageTitle: 'Choir · Repertoire coach',
      allowWrites: false,
    });

    if (!text) {
      return { ok: false, error: 'AI returned empty repertoire guidance.' };
    }

    return {
      ok: true,
      guidance: text,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : 'Repertoire coaching failed.',
    };
  }
}
