import {
  ACTIVITY_FLOOR_PLAN_FIELDS,
  ACTIVITY_KITCHEN_FIELDS,
  ACTIVITY_MEDIA_FIELDS,
} from '../constants/activity-request.constants';
import {
  activityRequestReviewResponseSchema,
  type ActivityRequestReviewResponse,
  type ActivityReviewFinding,
} from '../schemas/activity-request-review.schemas';
import type { ActivityRequest } from '../types/activity-request.types';
import {
  CHURCH_EVENT_TYPE_LABELS,
  type ChurchEvent,
  type ChurchEventType,
} from '../types/church-event.types';
import { needsSaturdayTrusteeNote } from './activity-request-defaults.utils';
import { getLeadTimeBanner } from './event-lead-time.utils';
import { extractJsonObject } from './event-time-suggest.utils';

export type ActivityRequestReviewDraft = {
  title: string;
  eventType: ChurchEventType;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  spaceId?: string;
  locationMode: 'church' | 'offsite' | 'unset';
  notes?: string;
  ministryId?: string;
  ministryName?: string;
  status: 'draft' | 'pending_approval' | 'scheduled';
  activityRequest: ActivityRequest;
  excludeEventId?: string;
  spaceConflictMessage?: string | null;
};

export type ActivityRequestReviewPromptContext = {
  draft: ActivityRequestReviewDraft;
  nearbyEvents: readonly ChurchEvent[];
};

function statusFromFindings(
  findings: readonly ActivityReviewFinding[],
): ActivityRequestReviewResponse['status'] {
  if (findings.some((item) => item.severity === 'blocker')) return 'blocked';
  if (findings.some((item) => item.severity === 'warning')) {
    return 'needs_attention';
  }
  return 'ok';
}

function summaryFromFindings(
  findings: readonly ActivityReviewFinding[],
): string {
  const status = statusFromFindings(findings);
  if (status === 'ok') {
    return 'No schedule or form problems stood out. You can save when ready.';
  }
  if (status === 'blocked') {
    const count = findings.filter((item) => item.severity === 'blocker').length;
    return `Found ${count} issue${count === 1 ? '' : 's'} to fix before this looks ready.`;
  }
  const count = findings.filter((item) => item.severity === 'warning').length;
  return `Looks mostly fine, with ${count} thing${count === 1 ? '' : 's'} to double-check.`;
}

/** Deterministic checks — always run (Cursor optional for extra tips). */
export function buildLocalActivityRequestReview(
  draft: ActivityRequestReviewDraft,
): ActivityRequestReviewResponse {
  const findings: ActivityReviewFinding[] = [];
  const activity = draft.activityRequest;

  if (draft.spaceConflictMessage?.trim()) {
    findings.push({
      severity: 'blocker',
      area: 'schedule',
      message: draft.spaceConflictMessage.trim(),
    });
  }

  if (draft.startTime && draft.endTime && draft.endTime <= draft.startTime) {
    findings.push({
      severity: 'blocker',
      area: 'schedule',
      message: 'End time must be after start time.',
    });
  }

  if (draft.locationMode === 'unset') {
    findings.push({
      severity: 'blocker',
      area: 'form',
      message: 'Choose at the church or somewhere else.',
    });
  } else if (draft.locationMode === 'church' && !draft.spaceId) {
    findings.push({
      severity: 'blocker',
      area: 'form',
      message: 'Pick a church room, or choose somewhere else.',
    });
  } else if (draft.locationMode === 'offsite' && !draft.location?.trim()) {
    findings.push({
      severity: 'blocker',
      area: 'form',
      message: 'Add the offsite place or address.',
    });
  }

  const mediaAny = ACTIVITY_MEDIA_FIELDS.some((field) => activity.media[field]);
  if (activity.media.noneConfirmed && !mediaAny) {
    // ok
  } else if (activity.media.needed && mediaAny) {
    // ok
  } else {
    findings.push({
      severity: 'blocker',
      area: 'media',
      message:
        'On Media, check what you need or choose No media needed.',
    });
  }

  const kitchenAny = ACTIVITY_KITCHEN_FIELDS.some(
    (field) => activity.kitchen[field],
  );
  if (activity.kitchen.noneConfirmed && !kitchenAny) {
    // ok
  } else if (activity.kitchen.needed && kitchenAny) {
    // ok
  } else {
    findings.push({
      severity: 'blocker',
      area: 'kitchen',
      message:
        'On Kitchen, check what you need or choose No kitchen / food needed.',
    });
  }

  const floorAny = ACTIVITY_FLOOR_PLAN_FIELDS.some(
    (field) => Number(activity.floorPlan[field]) > 0,
  );
  if (activity.floorPlan.noneConfirmed && !floorAny) {
    // ok
  } else if (activity.floorPlan.needed && floorAny) {
    // ok
  } else {
    findings.push({
      severity: 'blocker',
      area: 'floorPlan',
      message:
        'On Floor plan, set setup quantities or choose No floor plan needed.',
    });
  }

  const ack = activity.acknowledgements;
  if (
    !ack.cleanRoom ||
    !ack.noBannersWithoutPermission ||
    !ack.conflictMayReschedule
  ) {
    findings.push({
      severity: 'blocker',
      area: 'form',
      message: 'Confirm all three acknowledgements on Review.',
    });
  }

  const lead = getLeadTimeBanner(draft.eventDate);
  if (lead?.tier === 'emergency') {
    if (!activity.emergencyReason?.trim()) {
      findings.push({
        severity: 'blocker',
        area: 'leadTime',
        message: 'Add a short reason for this emergency timing.',
      });
    }
    if (!activity.willContactOffice) {
      findings.push({
        severity: 'blocker',
        area: 'leadTime',
        message: 'Confirm that you will contact the church office.',
      });
    }
  } else if (lead?.tier === 'short') {
    findings.push({
      severity: 'warning',
      area: 'leadTime',
      message: lead.message,
    });
  }

  if (
    needsSaturdayTrusteeNote(draft.eventDate, draft.startTime) &&
    !activity.coordination.helpFrom.includes('trustees')
  ) {
    findings.push({
      severity: 'warning',
      area: 'coordination',
      message:
        'Saturday after noon usually needs a duty trustee — consider adding Trustees under Help from.',
    });
  }

  if (
    (draft.eventType === 'worship' || draft.eventType === 'special') &&
    activity.media.noneConfirmed
  ) {
    findings.push({
      severity: 'warning',
      area: 'media',
      message: `${CHURCH_EVENT_TYPE_LABELS[draft.eventType]} usually needs media — double-check No media needed.`,
    });
  }

  if (
    activity.kitchen.heatingCooking &&
    draft.locationMode === 'offsite'
  ) {
    findings.push({
      severity: 'warning',
      area: 'kitchen',
      message:
        'Kitchen heating/cooking was requested, but the event is marked somewhere else.',
    });
  }

  if (
    draft.status === 'pending_approval' &&
    !draft.eventDate?.trim()
  ) {
    findings.push({
      severity: 'warning',
      area: 'schedule',
      message: 'Submitting for approval without a date — office may ask you to set one.',
    });
  }

  if (!draft.title.trim()) {
    findings.push({
      severity: 'tip',
      area: 'form',
      message: 'A clear title helps the office and calendar readers.',
    });
  }

  if (!activity.contactName?.trim() && draft.status !== 'draft') {
    findings.push({
      severity: 'warning',
      area: 'form',
      message: 'Add a contact name so the office knows who to call.',
    });
  }

  return {
    summary: summaryFromFindings(findings),
    status: statusFromFindings(findings),
    findings,
  };
}

export function buildActivityRequestReviewPrompt(
  context: ActivityRequestReviewPromptContext,
): string {
  const { draft, nearbyEvents } = context;
  const local = buildLocalActivityRequestReview(draft);

  const nearby = nearbyEvents
    .slice(0, 25)
    .map((event) =>
      [
        event.eventDate ?? 'TBD',
        event.startTime ?? '?',
        event.endTime ?? '?',
        event.title || 'Untitled',
        event.location ?? '',
        event.spaceId ?? '',
        event.status,
      ].join(' | '),
    )
    .join('\n');

  return [
    'Review this Ebenezer Baptist Church activity request for conflicts and form problems.',
    'Return ONLY a JSON object with shape:',
    '{"summary":"string","status":"ok"|"needs_attention"|"blocked","findings":[{"severity":"blocker"|"warning"|"tip","area":"schedule"|"form"|"media"|"kitchen"|"floorPlan"|"coordination"|"leadTime"|"other","message":"string"}]}',
    'Do not invent room conflicts not supported by the data. Prefer plain church language.',
    'You may add tip/warning findings the local checks missed. Keep findings to 8 or fewer total extras.',
    '',
    'Local findings already computed (include these, then add only new useful ones):',
    JSON.stringify(local),
    '',
    'Draft:',
    JSON.stringify({
      title: draft.title,
      eventType: draft.eventType,
      eventDate: draft.eventDate,
      startTime: draft.startTime,
      endTime: draft.endTime,
      location: draft.location,
      spaceId: draft.spaceId,
      locationMode: draft.locationMode,
      notes: draft.notes,
      ministryName: draft.ministryName,
      status: draft.status,
      activityRequest: {
        ...draft.activityRequest,
        contactPhone: draft.activityRequest.contactPhone
          ? '[provided]'
          : undefined,
      },
    }),
    '',
    'Nearby calendar rows (date | start | end | title | location | spaceId | status):',
    nearby || '(none)',
  ].join('\n');
}

export function parseActivityRequestReviewResponse(
  text: string,
  fallback: ActivityRequestReviewResponse,
): ActivityRequestReviewResponse {
  try {
    const raw = extractJsonObject(text);
    const parsed = activityRequestReviewResponseSchema.safeParse(raw);
    if (!parsed.success) return fallback;

    const merged = new Map<string, ActivityReviewFinding>();
    for (const finding of [...fallback.findings, ...parsed.data.findings]) {
      const key = `${finding.severity}:${finding.area}:${finding.message}`;
      merged.set(key, finding);
    }
    const findings = [...merged.values()].slice(0, 20);
    return {
      summary: parsed.data.summary.trim() || summaryFromFindings(findings),
      status: statusFromFindings(findings),
      findings,
    };
  } catch {
    return fallback;
  }
}

export function mergeReviewFindings(
  local: ActivityRequestReviewResponse,
  ai: ActivityRequestReviewResponse | null,
): ActivityRequestReviewResponse {
  if (!ai) return local;
  return parseActivityRequestReviewResponse(
    JSON.stringify(ai),
    local,
  );
}
