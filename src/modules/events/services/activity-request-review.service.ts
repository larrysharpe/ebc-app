import { getCursorConfig } from '@/lib/cursor';
import { collectCursorPromptText } from '@/modules/cursor/services/cursor-agent.service';
import { getMinistryById } from '@/modules/ministries';

import { listChurchEvents } from '../repositories/church-event.repository';
import type { ActivityRequestReviewResponse } from '../schemas/activity-request-review.schemas';
import { checkChurchSpaceConflicts } from './space-conflict.service';
import {
  buildActivityRequestReviewPrompt,
  buildLocalActivityRequestReview,
  parseActivityRequestReviewResponse,
  type ActivityRequestReviewDraft,
} from '../utils/activity-request-review.utils';

export type ActivityRequestReviewServiceResult =
  | {
      ok: true;
      review: ActivityRequestReviewResponse;
      generatedAt: string;
      usedAi: boolean;
    }
  | { ok: false; error: string };

export async function reviewActivityRequest(
  draft: ActivityRequestReviewDraft,
): Promise<ActivityRequestReviewServiceResult> {
  let spaceConflictMessage = draft.spaceConflictMessage ?? null;
  if (draft.spaceId && draft.eventDate && draft.locationMode === 'church') {
    const conflict = await checkChurchSpaceConflicts({
      spaceId: draft.spaceId,
      eventDate: draft.eventDate,
      startTime: draft.startTime,
      endTime: draft.endTime,
      excludeEventId: draft.excludeEventId,
    });
    spaceConflictMessage = conflict.message;
  }

  const draftWithConflict: ActivityRequestReviewDraft = {
    ...draft,
    spaceConflictMessage,
  };

  const local = buildLocalActivityRequestReview(draftWithConflict);

  const fromDate =
    draft.eventDate?.trim() ||
    new Date().toISOString().slice(0, 10);
  const [calendarEvents, ministry] = await Promise.all([
    listChurchEvents({ fromDate, includeCancelled: false }),
    draft.ministryId ? getMinistryById(draft.ministryId) : Promise.resolve(null),
  ]);

  const nearbyEvents = calendarEvents
    .filter((event) => {
      if (!draft.eventDate) return true;
      if (!event.eventDate) return false;
      const diff = Math.abs(
        Date.parse(`${event.eventDate}T12:00:00`) -
          Date.parse(`${draft.eventDate}T12:00:00`),
      );
      return diff <= 14 * 24 * 60 * 60 * 1000;
    })
    .slice(0, 30);

  const { enabled } = getCursorConfig();
  if (!enabled) {
    return {
      ok: true,
      review: local,
      generatedAt: new Date().toISOString(),
      usedAi: false,
    };
  }

  const prompt = buildActivityRequestReviewPrompt({
    draft: {
      ...draftWithConflict,
      ministryName: draft.ministryName ?? ministry?.name,
    },
    nearbyEvents,
  });

  try {
    const text = await collectCursorPromptText({
      prompt,
      purpose: 'activity-request-review-help',
      pagePath: draft.ministryId
        ? `/ministries/${ministry?.slug ?? draft.ministryId}?tab=calendar`
        : '/events',
      pageTitle: 'Activity request review',
      allowWrites: false,
    });

    if (text) {
      const review = parseActivityRequestReviewResponse(text, local);
      return {
        ok: true,
        review,
        generatedAt: new Date().toISOString(),
        usedAi: true,
      };
    }

    return {
      ok: true,
      review: local,
      generatedAt: new Date().toISOString(),
      usedAi: false,
    };
  } catch {
    return {
      ok: true,
      review: local,
      generatedAt: new Date().toISOString(),
      usedAi: false,
    };
  }
}
