'use server';

import { revalidatePath } from 'next/cache';

import {
  getSession,
  PermissionDeniedError,
} from '@/modules/auth/services/auth.service';
import { getMinistryById } from '@/modules/ministries';

import {
  createChurchEvent,
  createChurchEvents,
  deleteChurchEvent,
  getChurchEventById,
  updateChurchEvent,
} from '../repositories/church-event.repository';
import { churchEventInputSchema } from '../schemas/church-event.schemas';
import type { EventTimeSuggestResponse } from '../schemas/event-time-suggest.schemas';
import type { ActivityRequestReviewResponse } from '../schemas/activity-request-review.schemas';
import { reviewActivityRequest } from '../services/activity-request-review.service';
import { suggestEventTime } from '../services/event-time-suggest.service';
import { checkChurchSpaceConflicts } from '../services/space-conflict.service';
import type { ActivityRequest } from '../types/activity-request.types';
import type {
  ChurchEvent,
  ChurchEventStatus,
  ChurchEventType,
} from '../types/church-event.types';
import {
  canApproveActivityRequest,
  canManageChurchWideEvents,
  canManageMinistryEvents,
} from '../utils/church-event-access.utils';
import {
  expandRecurrenceDates,
  formatRecurrenceLabel,
} from '../utils/event-recurrence.utils';
import type { EventTimeSuggestDraft } from '../utils/event-time-suggest.utils';
import {
  getLeadTimeTierForDate,
  requiresEmergencyApproval,
} from '../utils/event-lead-time.utils';
import type { EventRecurrencePattern } from '../constants/event-recurrence.constants';
import type { z } from 'zod';

function revalidateEventPaths(ministrySlug?: string): void {
  revalidatePath('/events');
  revalidatePath('/ministries');
  if (ministrySlug) {
    revalidatePath(`/ministries/${ministrySlug}`);
  }
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeActivityRequest(
  value: ActivityRequest | undefined,
  eventDate: string | undefined,
): ActivityRequest | undefined {
  if (!value) return undefined;
  const tier = value.leadTimeTier ?? getLeadTimeTierForDate(eventDate) ?? undefined;
  return {
    kitchen: {
      needed: value.kitchen.needed,
      noneConfirmed: Boolean(value.kitchen.noneConfirmed),
      heatingCooking: Boolean(value.kitchen.heatingCooking),
      utensils: Boolean(value.kitchen.utensils),
      plates: Boolean(value.kitchen.plates),
      cupsGlasses: Boolean(value.kitchen.cupsGlasses),
      napkinsTableCloths: Boolean(value.kitchen.napkinsTableCloths),
      coffee: Boolean(value.kitchen.coffee),
      refrigeration: Boolean(value.kitchen.refrigeration),
      freezer: Boolean(value.kitchen.freezer),
      notes: normalizeOptional(value.kitchen.notes),
    },
    media: {
      needed: value.media.needed,
      noneConfirmed: Boolean(value.media.noneConfirmed),
      sound: value.media.sound,
      slides: value.media.slides,
      livestream: value.media.livestream,
      camera: value.media.camera,
      graphics: value.media.graphics,
      playback: Boolean(value.media.playback),
      notes: normalizeOptional(value.media.notes),
    },
    floorPlan: {
      needed: value.floorPlan.needed,
      noneConfirmed: Boolean(value.floorPlan.noneConfirmed),
      theaterSeating: Number(value.floorPlan.theaterSeating) || 0,
      roundTables: Number(value.floorPlan.roundTables) || 0,
      classroomSeating: Number(value.floorPlan.classroomSeating) || 0,
      podium: Number(value.floorPlan.podium) || 0,
      registrationTable: Number(value.floorPlan.registrationTable) || 0,
      servingTables: Number(value.floorPlan.servingTables) || 0,
      clearFloor: Number(value.floorPlan.clearFloor) || 0,
      accessibilitySeating: Number(value.floorPlan.accessibilitySeating) || 0,
      notes: normalizeOptional(value.floorPlan.notes),
    },
    coordination: {
      bulletin: value.coordination.bulletin,
      otherChurches: value.coordination.otherChurches,
      flyerCopies: value.coordination.flyerCopies,
      financialVoucher: value.coordination.financialVoucher,
      helpFrom: [...value.coordination.helpFrom],
    },
    acknowledgements: { ...value.acknowledgements },
    contactName: normalizeOptional(value.contactName),
    contactPhone: normalizeOptional(value.contactPhone),
    participantsEstimate: value.participantsEstimate,
    guestSpeaker: normalizeOptional(value.guestSpeaker),
    emergencyReason: normalizeOptional(value.emergencyReason),
    willContactOffice: value.willContactOffice,
    leadTimeTier: tier,
    submittedAt: value.submittedAt,
    approvedByUserId: value.approvedByUserId,
    approvedAt: value.approvedAt,
    returnedAt: value.returnedAt,
    returnReason: normalizeOptional(value.returnReason),
  };
}

function toActivityRequest(
  value: z.infer<typeof churchEventInputSchema>['activityRequest'],
  eventDate: string | undefined,
): ActivityRequest | undefined {
  if (!value) return undefined;
  return normalizeActivityRequest(value as ActivityRequest, eventDate);
}

async function resolveActor(): Promise<
  | {
      ok: true;
      userId: string;
      roles: readonly string[];
      ministryIds: readonly string[];
    }
  | { ok: false; error: string }
> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, error: 'You must be signed in.' };
    return {
      ok: true,
      userId: session.id,
      roles: session.roles,
      ministryIds: session.ministryIds ?? [],
    };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return { ok: false, error: 'You do not have permission for this action.' };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

function assertCanWrite(
  actor: { roles: readonly string[]; ministryIds: readonly string[] },
  ministryId: string | undefined,
): string | null {
  if (!ministryId) {
    return canManageChurchWideEvents(actor)
      ? null
      : 'Only office staff can create church-wide events.';
  }
  return canManageMinistryEvents(actor, ministryId)
    ? null
    : 'You do not have permission for this ministry.';
}

type WritableStatus = 'draft' | 'pending_approval' | 'scheduled';

function resolveWriteStatus(options: {
  requested: WritableStatus;
  ministryId: string | undefined;
  eventDate: string | undefined;
  canScheduleDirectly: boolean;
}): WritableStatus | { error: string } {
  const { requested, ministryId, eventDate, canScheduleDirectly } = options;

  if (requested === 'draft') return 'draft';

  if (requested === 'scheduled') {
    if (!canScheduleDirectly) {
      return {
        error:
          'Ministry leaders submit events for approval — use Submit for approval.',
      };
    }
    if (ministryId && requiresEmergencyApproval(eventDate) && !canScheduleDirectly) {
      return {
        error: 'Emergency timing must go through approval. Contact the office.',
      };
    }
    return 'scheduled';
  }

  // pending_approval
  if (!ministryId && !canScheduleDirectly) {
    return { error: 'You cannot submit church-wide events for approval.' };
  }
  return 'pending_approval';
}

export async function createChurchEventAction(input: {
  eventDate?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  spaceId?: string;
  notes?: string;
  recurring?: string;
  recurrencePattern?: string;
  recurrenceUntil?: string;
  recurrenceWeekdays?: number[];
  recurrenceIntervalWeeks?: number;
  eventType?: string;
  ministryId?: string;
  activityRequest?: ActivityRequest;
  /** Ministry calendars default to draft; staff Events can pass scheduled. */
  status?: WritableStatus;
}): Promise<
  | { ok: true; event: ChurchEvent; createdCount: number }
  | { ok: false; error: string }
> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  const ministryIdHint = normalizeOptional(input.ministryId);
  const canScheduleDirectly = canManageChurchWideEvents(actor);
  const defaultStatus: WritableStatus =
    input.status ?? (ministryIdHint ? 'draft' : 'scheduled');

  const eventDateHint = normalizeOptional(input.eventDate);
  const activityRequest = normalizeActivityRequest(
    input.activityRequest,
    eventDateHint,
  );

  const parsed = churchEventInputSchema.safeParse({
    ...input,
    status: defaultStatus,
    activityRequest,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid event.' };
  }

  const ministryId = normalizeOptional(parsed.data.ministryId);
  const denied = assertCanWrite(actor, ministryId);
  if (denied) return { ok: false, error: denied };

  if (
    parsed.data.startTime &&
    parsed.data.endTime &&
    parsed.data.endTime <= parsed.data.startTime
  ) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  const requestedStatus =
    parsed.data.status === 'cancelled'
      ? 'scheduled'
      : (parsed.data.status as WritableStatus);
  const statusResult = resolveWriteStatus({
    requested: requestedStatus,
    ministryId,
    eventDate: normalizeOptional(parsed.data.eventDate),
    canScheduleDirectly,
  });
  if (typeof statusResult === 'object' && 'error' in statusResult) {
    return { ok: false, error: statusResult.error };
  }
  const status = statusResult;

  let ministrySlug: string | undefined;
  if (ministryId) {
    const ministry = await getMinistryById(ministryId);
    if (!ministry) return { ok: false, error: 'Ministry not found.' };
    ministrySlug = ministry.slug;
  }

  const eventDate = normalizeOptional(parsed.data.eventDate);
  const pattern = parsed.data.recurrencePattern as EventRecurrencePattern;
  const title = parsed.data.title?.trim() ?? '';
  const startTime = normalizeOptional(parsed.data.startTime);
  const endTime = normalizeOptional(parsed.data.endTime);
  const location = normalizeOptional(parsed.data.location);
  const spaceId = normalizeOptional(parsed.data.spaceId);
  const notes = normalizeOptional(parsed.data.notes);
  const eventType = parsed.data.eventType as ChurchEventType;
  const recurrenceUntil = normalizeOptional(parsed.data.recurrenceUntil);
  const recurrenceWeekdays = parsed.data.recurrenceWeekdays;
  const recurrenceIntervalWeeks = parsed.data.recurrenceIntervalWeeks;

  const baseActivity = toActivityRequest(parsed.data.activityRequest, eventDate);
  const normalizedActivity: ActivityRequest | undefined =
    status === 'pending_approval' && baseActivity
      ? { ...baseActivity, submittedAt: new Date().toISOString() }
      : baseActivity;

  const recurrenceOptions = {
    weekdays: recurrenceWeekdays,
    intervalWeeks: recurrenceIntervalWeeks,
  };

  if (spaceId && eventDate) {
    const conflictDates =
      pattern === 'none'
        ? [eventDate]
        : expandRecurrenceDates({
            startDate: eventDate,
            pattern,
            untilDate: recurrenceUntil,
            ...recurrenceOptions,
          });
    const conflict = await checkChurchSpaceConflicts({
      spaceId,
      eventDate,
      startTime,
      endTime,
      dates: conflictDates,
    });
    if (conflict.message) {
      return { ok: false, error: conflict.message };
    }
  }

  if (pattern === 'none' || !eventDate) {
    const recurring =
      normalizeOptional(parsed.data.recurring) ??
      (pattern !== 'none' && eventDate
        ? formatRecurrenceLabel(pattern, eventDate, recurrenceOptions)
        : undefined);
    const event = await createChurchEvent({
      eventDate,
      title,
      startTime,
      endTime,
      location,
      spaceId,
      notes,
      recurring,
      recurrencePattern: pattern === 'none' ? undefined : pattern,
      eventType,
      status,
      activityRequest: normalizedActivity,
      ministryId,
    });
    revalidateEventPaths(ministrySlug);
    return { ok: true, event, createdCount: 1 };
  }

  const dates = expandRecurrenceDates({
    startDate: eventDate,
    pattern,
    untilDate: recurrenceUntil,
    ...recurrenceOptions,
  });
  if (dates.length === 0) {
    return { ok: false, error: 'Could not build repeat dates from that pattern.' };
  }

  const recurring =
    normalizeOptional(parsed.data.recurring) ??
    formatRecurrenceLabel(pattern, eventDate, recurrenceOptions);
  const seriesId = `series-${crypto.randomUUID().slice(0, 8)}`;

  const created = await createChurchEvents(
    dates.map((date) => ({
      eventDate: date,
      title,
      startTime,
      endTime,
      location,
      spaceId,
      notes,
      recurring,
      recurrencePattern: pattern,
      seriesId,
      eventType,
      status,
      activityRequest: normalizedActivity,
      ministryId,
    })),
  );

  revalidateEventPaths(ministrySlug);
  return {
    ok: true,
    event: created[0] ?? {
      id: '',
      title,
      eventDate,
      startTime,
      endTime,
      location,
      spaceId,
      notes,
      recurring,
      recurrencePattern: pattern,
      seriesId,
      eventType,
      status,
      activityRequest: normalizedActivity,
      ministryId,
    },
    createdCount: created.length,
  };
}

export async function updateChurchEventAction(
  id: string,
  input: {
    eventDate?: string;
    title?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    spaceId?: string;
    notes?: string;
    recurring?: string;
    eventType?: string;
    status?: WritableStatus;
    activityRequest?: ActivityRequest;
  },
): Promise<{ ok: true; event: ChurchEvent } | { ok: false; error: string }> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  const existing = await getChurchEventById(id);
  if (!existing) return { ok: false, error: 'Event not found.' };

  const denied = assertCanWrite(actor, existing.ministryId);
  if (denied) return { ok: false, error: denied };

  if (existing.status === 'cancelled') {
    return { ok: false, error: 'Cancelled events cannot be edited.' };
  }

  const canScheduleDirectly = canManageChurchWideEvents(actor);
  const eventDateHint = normalizeOptional(input.eventDate) ?? existing.eventDate;
  const activityRequest = normalizeActivityRequest(
    input.activityRequest ?? existing.activityRequest,
    eventDateHint,
  );

  const parsed = churchEventInputSchema.safeParse({
    eventDate: input.eventDate ?? existing.eventDate ?? '',
    title: input.title ?? existing.title,
    startTime: input.startTime ?? existing.startTime ?? '',
    endTime: input.endTime ?? existing.endTime ?? '',
    location: input.location ?? existing.location ?? '',
    spaceId:
      input.spaceId !== undefined
        ? input.spaceId
        : (existing.spaceId ?? ''),
    notes: input.notes ?? existing.notes ?? '',
    recurring: input.recurring ?? existing.recurring ?? '',
    recurrencePattern: 'none',
    eventType: input.eventType ?? existing.eventType,
    status: input.status ?? existing.status,
    ministryId: existing.ministryId ?? '',
    activityRequest,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid event.' };
  }

  if (
    parsed.data.startTime &&
    parsed.data.endTime &&
    parsed.data.endTime <= parsed.data.startTime
  ) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  const requestedStatus =
    parsed.data.status === 'cancelled'
      ? 'scheduled'
      : (parsed.data.status as WritableStatus);
  let nextStatus: ChurchEventStatus = existing.status;
  if (
    requestedStatus === 'draft' ||
    requestedStatus === 'pending_approval' ||
    requestedStatus === 'scheduled'
  ) {
    const statusResult = resolveWriteStatus({
      requested: requestedStatus,
      ministryId: existing.ministryId,
      eventDate: normalizeOptional(parsed.data.eventDate),
      canScheduleDirectly,
    });
    if (typeof statusResult === 'object' && 'error' in statusResult) {
      return { ok: false, error: statusResult.error };
    }
    nextStatus = statusResult;
  }

  const nextSpaceId = normalizeOptional(parsed.data.spaceId);
  const nextEventDate = normalizeOptional(parsed.data.eventDate);
  const nextStart = normalizeOptional(parsed.data.startTime);
  const nextEnd = normalizeOptional(parsed.data.endTime);

  if (nextSpaceId && nextEventDate) {
    const conflict = await checkChurchSpaceConflicts({
      spaceId: nextSpaceId,
      eventDate: nextEventDate,
      startTime: nextStart,
      endTime: nextEnd,
      excludeEventId: id,
    });
    if (conflict.message) {
      return { ok: false, error: conflict.message };
    }
  }

  const baseActivity = toActivityRequest(
    parsed.data.activityRequest,
    nextEventDate,
  );
  const nextActivity: ActivityRequest | undefined =
    nextStatus === 'pending_approval' &&
    existing.status !== 'pending_approval' &&
    baseActivity
      ? { ...baseActivity, submittedAt: new Date().toISOString() }
      : baseActivity;

  const event = await updateChurchEvent(id, {
    title: parsed.data.title?.trim() ?? '',
    eventDate: nextEventDate,
    startTime: nextStart,
    endTime: nextEnd,
    location: normalizeOptional(parsed.data.location),
    spaceId: nextSpaceId,
    notes: normalizeOptional(parsed.data.notes),
    recurring: normalizeOptional(parsed.data.recurring) ?? existing.recurring,
    recurrencePattern: existing.recurrencePattern,
    seriesId: existing.seriesId,
    eventType: parsed.data.eventType as ChurchEventType,
    status: nextStatus,
    activityRequest: nextActivity,
    ministryId: existing.ministryId,
  });
  if (!event) return { ok: false, error: 'Event not found.' };

  let ministrySlug: string | undefined;
  if (existing.ministryId) {
    const ministry = await getMinistryById(existing.ministryId);
    ministrySlug = ministry?.slug;
  }
  revalidateEventPaths(ministrySlug);
  return { ok: true, event };
}

export async function approveChurchEventAction(
  id: string,
): Promise<{ ok: true; event: ChurchEvent } | { ok: false; error: string }> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  if (!canApproveActivityRequest(actor.roles)) {
    return {
      ok: false,
      error: 'Only office staff or trustees can approve activity requests.',
    };
  }

  const existing = await getChurchEventById(id);
  if (!existing) return { ok: false, error: 'Event not found.' };
  if (existing.status !== 'pending_approval') {
    return { ok: false, error: 'Only pending requests can be approved.' };
  }

  const approvedAt = new Date().toISOString();
  const event = await updateChurchEvent(id, {
    ...existing,
    status: 'scheduled',
    activityRequest: {
      kitchen: {
        needed: false,
        noneConfirmed: false,
        heatingCooking: false,
        utensils: false,
        plates: false,
        cupsGlasses: false,
        napkinsTableCloths: false,
        coffee: false,
        refrigeration: false,
        freezer: false,
      },
      media: {
        needed: false,
        noneConfirmed: false,
        sound: false,
        slides: false,
        livestream: false,
        camera: false,
        graphics: false,
        playback: false,
      },
      floorPlan: {
        needed: false,
        noneConfirmed: false,
        theaterSeating: 0,
        roundTables: 0,
        classroomSeating: 0,
        podium: 0,
        registrationTable: 0,
        servingTables: 0,
        clearFloor: 0,
        accessibilitySeating: 0,
      },
      coordination: {
        bulletin: false,
        otherChurches: false,
        flyerCopies: false,
        financialVoucher: false,
        helpFrom: [],
      },
      acknowledgements: {
        cleanRoom: false,
        noBannersWithoutPermission: false,
        conflictMayReschedule: false,
      },
      ...existing.activityRequest,
      approvedByUserId: actor.userId,
      approvedAt,
      returnedAt: undefined,
      returnReason: undefined,
    },
  });
  if (!event) return { ok: false, error: 'Event not found.' };

  let ministrySlug: string | undefined;
  if (existing.ministryId) {
    const ministry = await getMinistryById(existing.ministryId);
    ministrySlug = ministry?.slug;
  }
  revalidateEventPaths(ministrySlug);
  return { ok: true, event };
}

export async function returnChurchEventAction(
  id: string,
  input?: { reason?: string },
): Promise<{ ok: true; event: ChurchEvent } | { ok: false; error: string }> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  if (!canApproveActivityRequest(actor.roles)) {
    return {
      ok: false,
      error: 'Only office staff or trustees can return activity requests.',
    };
  }

  const existing = await getChurchEventById(id);
  if (!existing) return { ok: false, error: 'Event not found.' };
  if (existing.status !== 'pending_approval') {
    return { ok: false, error: 'Only pending requests can be returned.' };
  }

  const returnReason = normalizeOptional(input?.reason);
  const event = await updateChurchEvent(id, {
    ...existing,
    status: 'draft',
    activityRequest: {
      kitchen: {
        needed: false,
        noneConfirmed: false,
        heatingCooking: false,
        utensils: false,
        plates: false,
        cupsGlasses: false,
        napkinsTableCloths: false,
        coffee: false,
        refrigeration: false,
        freezer: false,
      },
      media: {
        needed: false,
        noneConfirmed: false,
        sound: false,
        slides: false,
        livestream: false,
        camera: false,
        graphics: false,
        playback: false,
      },
      floorPlan: {
        needed: false,
        noneConfirmed: false,
        theaterSeating: 0,
        roundTables: 0,
        classroomSeating: 0,
        podium: 0,
        registrationTable: 0,
        servingTables: 0,
        clearFloor: 0,
        accessibilitySeating: 0,
      },
      coordination: {
        bulletin: false,
        otherChurches: false,
        flyerCopies: false,
        financialVoucher: false,
        helpFrom: [],
      },
      acknowledgements: {
        cleanRoom: false,
        noBannersWithoutPermission: false,
        conflictMayReschedule: false,
      },
      ...existing.activityRequest,
      returnedAt: new Date().toISOString(),
      returnReason,
    },
  });
  if (!event) return { ok: false, error: 'Event not found.' };

  let ministrySlug: string | undefined;
  if (existing.ministryId) {
    const ministry = await getMinistryById(existing.ministryId);
    ministrySlug = ministry?.slug;
  }
  revalidateEventPaths(ministrySlug);
  return { ok: true, event };
}

export async function checkChurchSpaceConflictAction(input: {
  spaceId?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  excludeEventId?: string;
  recurrencePattern?: string;
  recurrenceUntil?: string;
  recurrenceWeekdays?: number[];
  recurrenceIntervalWeeks?: number;
}): Promise<
  | { ok: true; hasConflict: boolean; message: string | null }
  | { ok: false; error: string }
> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  const spaceId = normalizeOptional(input.spaceId);
  const eventDate = normalizeOptional(input.eventDate);
  if (!spaceId || !eventDate) {
    return { ok: true, hasConflict: false, message: null };
  }

  const pattern = (input.recurrencePattern ?? 'none') as EventRecurrencePattern;
  const dates =
    pattern === 'none'
      ? [eventDate]
      : expandRecurrenceDates({
          startDate: eventDate,
          pattern,
          untilDate: normalizeOptional(input.recurrenceUntil),
          weekdays: input.recurrenceWeekdays,
          intervalWeeks: input.recurrenceIntervalWeeks,
        });

  const conflict = await checkChurchSpaceConflicts({
    spaceId,
    eventDate,
    startTime: normalizeOptional(input.startTime),
    endTime: normalizeOptional(input.endTime),
    excludeEventId: normalizeOptional(input.excludeEventId),
    dates,
  });

  return {
    ok: true,
    hasConflict: conflict.conflicts.length > 0,
    message: conflict.message,
  };
}

export async function publishChurchEventAction(
  id: string,
): Promise<{ ok: true; event: ChurchEvent } | { ok: false; error: string }> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  const existing = await getChurchEventById(id);
  if (!existing) return { ok: false, error: 'Event not found.' };

  if (existing.status === 'pending_approval') {
    if (!canApproveActivityRequest(actor.roles)) {
      return {
        ok: false,
        error: 'Pending requests need office or trustee approval.',
      };
    }
    return approveChurchEventAction(id);
  }

  return updateChurchEventAction(id, { status: 'scheduled' });
}

export async function suggestEventTimeAction(
  draft: EventTimeSuggestDraft,
): Promise<
  | { ok: true; suggestion: EventTimeSuggestResponse; generatedAt: string }
  | { ok: false; error: string }
> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  const ministryId = normalizeOptional(draft.ministryId);
  const denied = assertCanWrite(actor, ministryId);
  if (denied) return { ok: false, error: denied };

  return suggestEventTime({
    ...draft,
    ministryId,
    title: draft.title?.trim(),
    location: draft.location?.trim(),
    notes: draft.notes?.trim(),
    recurring: draft.recurring?.trim(),
    preference: draft.preference?.trim(),
  });
}

export async function reviewActivityRequestAction(input: {
  title: string;
  eventType: string;
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
}): Promise<
  | {
      ok: true;
      review: ActivityRequestReviewResponse;
      generatedAt: string;
      usedAi: boolean;
    }
  | { ok: false; error: string }
> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  const ministryId = normalizeOptional(input.ministryId);
  const denied = assertCanWrite(actor, ministryId);
  if (denied) return { ok: false, error: denied };

  return reviewActivityRequest({
    ...input,
    eventType: input.eventType as ChurchEventType,
    ministryId,
    title: input.title.trim(),
    eventDate: normalizeOptional(input.eventDate),
    startTime: normalizeOptional(input.startTime),
    endTime: normalizeOptional(input.endTime),
    location: normalizeOptional(input.location),
    spaceId: normalizeOptional(input.spaceId),
    notes: normalizeOptional(input.notes),
  });
}

export async function cancelChurchEventAction(
  id: string,
): Promise<{ ok: true; event: ChurchEvent } | { ok: false; error: string }> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  const existing = await getChurchEventById(id);
  if (!existing) return { ok: false, error: 'Event not found.' };

  const denied = assertCanWrite(actor, existing.ministryId);
  if (denied) return { ok: false, error: denied };

  const event = await updateChurchEvent(id, {
    ...existing,
    status: 'cancelled',
  });
  if (!event) return { ok: false, error: 'Event not found.' };

  let ministrySlug: string | undefined;
  if (existing.ministryId) {
    const ministry = await getMinistryById(existing.ministryId);
    ministrySlug = ministry?.slug;
  }
  revalidateEventPaths(ministrySlug);
  return { ok: true, event };
}

export async function deleteChurchEventAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await resolveActor();
  if (!actor.ok) return actor;

  const existing = await getChurchEventById(id);
  if (!existing) return { ok: false, error: 'Event not found.' };

  const denied = assertCanWrite(actor, existing.ministryId);
  if (denied) return { ok: false, error: denied };

  const deleted = await deleteChurchEvent(id);
  if (!deleted) return { ok: false, error: 'Event not found.' };

  let ministrySlug: string | undefined;
  if (existing.ministryId) {
    const ministry = await getMinistryById(existing.ministryId);
    ministrySlug = ministry?.slug;
  }
  revalidateEventPaths(ministrySlug);
  return { ok: true };
}
