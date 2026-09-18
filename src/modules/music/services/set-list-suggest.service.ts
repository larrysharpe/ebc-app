import { getCursorConfig } from '@/lib/cursor';
import { collectCursorPromptText } from '@/modules/cursor/services/cursor-agent.service';
import { formatChurchEventDisplayTitle } from '@/modules/events';
import { getChurchEventById } from '@/modules/events/repositories/church-event.repository';

import { getPlans, getPlanById, getSongs } from '../repository/music.repository';
import type { ServiceMusicPlan } from '../types';
import { buildRepertoireSnapshot } from '../utils/repertoire.utils';
import {
  buildSetListSuggestPrompt,
  parseSetListSuggestResponse,
  type SetListSuggestion,
} from '../utils/set-list-suggest.utils';

export type SetListSuggestServiceResult =
  | { ok: true; suggestion: SetListSuggestion; generatedAt: string }
  | { ok: false; error: string };

export async function suggestPlanSetList(
  planId: string,
  now: Date = new Date(),
): Promise<SetListSuggestServiceResult> {
  const { enabled } = getCursorConfig();
  if (!enabled) {
    return {
      ok: false,
      error:
        'Cursor is not configured. Add CURSOR_API_KEY to enable song suggestions.',
    };
  }

  const [plan, songs, plans] = await Promise.all([
    getPlanById(planId),
    getSongs(),
    getPlans(),
  ]);

  if (!plan) return { ok: false, error: 'Plan not found.' };
  if (plan.songs.length === 0) {
    return {
      ok: false,
      error: 'Add service slots before requesting song suggestions.',
    };
  }
  if (songs.length === 0) {
    return { ok: false, error: 'Song catalog is empty.' };
  }

  const snapshot = buildRepertoireSnapshot(songs, plans, now);
  const occasionLabel = await resolveOccasionLabel(plan);
  const prompt = buildSetListSuggestPrompt({
    plan,
    songs,
    snapshot,
    occasionLabel,
  });

  try {
    const text = await collectCursorPromptText({
      prompt,
      purpose: 'set-list-suggest-help',
      pagePath: `/music/plans/${plan.id}`,
      pageTitle: plan.title,
      allowWrites: false,
    });

    if (!text) {
      return { ok: false, error: 'AI returned empty song suggestions.' };
    }

    const catalogIds = new Set(songs.map((song) => song.id));
    const suggestion = parseSetListSuggestResponse(text, plan, catalogIds);

    return {
      ok: true,
      suggestion,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : 'Song suggestion failed.',
    };
  }
}

async function resolveOccasionLabel(plan: ServiceMusicPlan): Promise<string> {
  const parts: string[] = [];
  if (plan.occasion?.trim()) parts.push(plan.occasion.trim());

  if (plan.churchEventId) {
    const event = await getChurchEventById(plan.churchEventId);
    if (event) parts.push(formatChurchEventDisplayTitle(event));
  }

  if (plan.title.trim() && !parts.includes(plan.title.trim())) {
    parts.push(plan.title.trim());
  }

  return parts.join(' · ') || 'General worship service';
}
