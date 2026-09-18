import { getCursorConfig } from '@/lib/cursor';
import { collectCursorPromptText } from '@/modules/cursor/services/cursor-agent.service';
import { getMinistryById } from '@/modules/ministries';

import { listChurchEvents } from '../repositories/church-event.repository';
import type { EventTimeSuggestResponse } from '../schemas/event-time-suggest.schemas';
import {
  buildEventTimeSuggestPrompt,
  buildLocalEventTimeSuggestions,
  parseEventTimeSuggestResponse,
  type EventTimeSuggestDraft,
  type EventTimeSuggestPromptContext,
} from '../utils/event-time-suggest.utils';
import {
  defaultPlanningWindow,
  listPlanningHolidays,
} from '../utils/planning-holidays.utils';

export type EventTimeSuggestServiceResult =
  | { ok: true; suggestion: EventTimeSuggestResponse; generatedAt: string }
  | { ok: false; error: string };

export async function suggestEventTime(
  draft: EventTimeSuggestDraft,
  now: Date = new Date(),
): Promise<EventTimeSuggestServiceResult> {
  const { fromIso, toIso } = defaultPlanningWindow(now);
  const [calendarEvents, ministry] = await Promise.all([
    listChurchEvents({ fromDate: fromIso, includeCancelled: false }),
    draft.ministryId ? getMinistryById(draft.ministryId) : Promise.resolve(null),
  ]);

  const inWindow = calendarEvents.filter(
    (event) => !event.eventDate || (event.eventDate >= fromIso && event.eventDate <= toIso),
  );
  const holidays = listPlanningHolidays(fromIso, toIso);
  const context: EventTimeSuggestPromptContext = {
    draft: {
      ...draft,
      ministryName: draft.ministryName ?? ministry?.name,
    },
    calendarEvents: inWindow,
    holidays,
    fromIso,
    toIso,
  };

  const { enabled } = getCursorConfig();
  if (!enabled) {
    return {
      ok: true,
      suggestion: {
        ...buildLocalEventTimeSuggestions(context),
        summary:
          'Cursor is not configured, so these options were chosen from the church calendar and holiday list.',
      },
      generatedAt: new Date().toISOString(),
    };
  }

  const prompt = buildEventTimeSuggestPrompt(context);

  try {
    const text = await collectCursorPromptText({
      prompt,
      purpose: 'event-time-suggest-help',
      pagePath: draft.ministryId
        ? `/ministries/${ministry?.slug ?? draft.ministryId}?tab=calendar`
        : '/events',
      pageTitle: 'Suggest event time',
      allowWrites: false,
    });

    if (text) {
      try {
        const suggestion = parseEventTimeSuggestResponse(text, fromIso, toIso);
        return {
          ok: true,
          suggestion,
          generatedAt: new Date().toISOString(),
        };
      } catch {
        // Fall through to local calendar/holiday options.
      }
    }

    return {
      ok: true,
      suggestion: buildLocalEventTimeSuggestions(context),
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      ok: true,
      suggestion: buildLocalEventTimeSuggestions(context),
      generatedAt: new Date().toISOString(),
    };
  }
}
