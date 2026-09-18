'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  PermissionDeniedError,
  requirePermission,
  requireSession,
} from '@/modules/auth/services/auth.service';
import { canPlanForChoir } from '@/modules/auth/utils/choir-scope.utils';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { getChurchEventById } from '@/modules/events/repositories/church-event.repository';
import {
  getPersonByEmail,
  listPeople,
} from '@/modules/members/repositories/person.repository';
import { notify } from '@/modules/notifications';

import { ledChoirIdsForPerson } from '../features/my-choirs';
import { listChoirs } from '../repository/choir.repository';
import { getChoirRotationConfig } from '../repository/choir-rotation.repository';
import { getChoirDirectorSettings } from '../repository/director-settings.repository';
import {
  createPlan,
  deletePlan,
  getPlanById,
  getPlans,
  getSongs,
  markPlanSent,
  updatePlan,
} from '../repository/music.repository';
import { generateRepertoireCoachGuidance } from '../services/repertoire-coach.service';
import { suggestPlanSetList } from '../services/set-list-suggest.service';
import type {
  ChoirGroup,
  PlanPractice,
  PlanSongSlot,
  PlanSongSlotType,
  ServiceMusicPlan,
} from '../types';
import {
  getDefaultChoirForDate,
  getDefaultDirectorName,
  getSundayOfMonth,
} from '../utils/choir-schedule.utils';
import {
  buildPlanDefaultsFromSettings,
  getDefaultServiceSlotsFromSettings,
} from '../utils/director-settings.utils';
import {
  buildPlanEmailBody,
  formatServiceDate,
} from '../utils/music.format';
import { listChoirPlanNotifyUserIds } from '../utils/plan-notify-audience.utils';
import { withSyncedPractices } from '../utils/plan-practice.utils';
import type { SetListSuggestion } from '../utils/set-list-suggest.utils';

function revalidateMusicPaths(planId?: string) {
  revalidatePath('/');
  revalidatePath('/music');
  revalidatePath('/music/plans');
  if (planId) revalidatePath(`/music/plans/${planId}`);
}

async function guardPermission(
  permission:
    | 'music.plans.edit'
    | 'music.plans.send'
    | 'music.songs.pick',
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requirePermission(permission);
    return { ok: true };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return { ok: false, error: 'You do not have permission for this action.' };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

export async function sendPlanAction(planId: string) {
  const allowed = await guardPermission('music.plans.send');
  if (!allowed.ok) return allowed;
  const session = await requireSession();
  const plan = await markPlanSent(planId);
  if (!plan) return { ok: false as const, error: 'Plan not found' };

  const rehearsePath = `/music/plans/${plan.id}/rehearse`;
  const [recipientUserIds, songs, churchEvent] = await Promise.all([
    listChoirPlanNotifyUserIds(plan.choirGroup, session.id),
    getSongs(),
    plan.churchEventId ? getChurchEventById(plan.churchEventId) : null,
  ]);

  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.APP_URL?.replace(/\/$/, '') ||
    '';
  const appHref = appOrigin ? `${appOrigin}${rehearsePath}` : rehearsePath;

  const message = buildPlanEmailBody(plan, songs, {
    location: churchEvent?.location ?? undefined,
    appHref,
  });

  const delivery = await notify({
    topic: 'music.plan.shared',
    actorUserId: session.id,
    recipientUserIds,
    title: plan.title,
    body: `${plan.title} for ${formatServiceDate(plan.serviceDate)} has been shared. Open the app to practice and respond.`,
    emailBody: message,
    href: rehearsePath,
    payload: { planId: plan.id },
  });

  revalidateMusicPaths(planId);

  return { ok: true as const, plan, delivery };
}

export async function deletePlanAction(
  planId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardPermission('music.plans.edit');
  if (!allowed.ok) return allowed;

  const existing = await getPlanById(planId);
  if (!existing) return { ok: false, error: 'Plan not found.' };

  const deleted = await deletePlan(planId);
  if (!deleted) return { ok: false, error: 'Could not delete plan.' };

  revalidateMusicPaths();
  return { ok: true };
}

export type CreatePlanInput = {
  title: string;
  serviceDate: string;
  churchEventId?: string;
  sundayServiceId?: string;
  choirGroup?: ChoirGroup;
  scheduleOverride?: boolean;
  scheduleNote?: string;
  serviceStartTime?: string;
  serviceEndTime?: string;
  practiceDate?: string;
  practiceStartTime?: string;
  practiceEndTime?: string;
  practiceLocation?: string;
  practices?: PlanPractice[];
  occasion?: string;
  attire?: string;
  arrivalTime?: string;
  scriptureReader?: string | null;
  prayerLeader?: string | null;
  directorNotes?: string;
  postServiceMessage?: string;
};

export async function createPlanAction(input: CreatePlanInput) {
  const allowed = await guardPermission('music.plans.edit');
  if (!allowed.ok) return allowed;

  const session = await requireSession();
  const access = getMusicAccess(session.roles);

  const title = input.title.trim();
  const serviceDate = input.serviceDate.trim();

  if (!title || !serviceDate) {
    return { ok: false as const, error: 'Title and service date are required.' };
  }

  const churchEventId = input.churchEventId?.trim() || undefined;
  if (churchEventId) {
    const churchEvent = await getChurchEventById(churchEventId);
    if (!churchEvent || churchEvent.status !== 'scheduled') {
      return { ok: false as const, error: 'Selected church event was not found.' };
    }
  }

  const [settings, rotationConfig, people, existingPlans, choirs, person] =
    await Promise.all([
      getChoirDirectorSettings(),
      getChoirRotationConfig(),
      listPeople({ limit: 500 }),
      getPlans(),
      listChoirs(),
      getPersonByEmail(session.email),
    ]);

  if (churchEventId) {
    const linked = existingPlans.find((plan) => plan.churchEventId === churchEventId);
    if (linked) {
      return {
        ok: false as const,
        error: `A choir plan already exists for this service. Open “${linked.title}” to edit it.`,
      };
    }
  }
  const fromSettings = buildPlanDefaultsFromSettings(serviceDate, settings);
  const sundayOfMonth = getSundayOfMonth(serviceDate);
  const rotationChoir = getDefaultChoirForDate(serviceDate, rotationConfig);
  const choirGroup = input.choirGroup ?? fromSettings.choirGroup;

  if (
    !canPlanForChoir(
      { roles: session.roles, choirIds: session.choirIds },
      choirGroup,
      {
        seeAll: access.canManageRotation,
        fallbackChoirIds: ledChoirIdsForPerson(choirs, person?.id),
      },
    )
  ) {
    return {
      ok: false as const,
      error: 'You can only create plans for choirs assigned to your account.',
    };
  }

  const scheduleOverride =
    input.scheduleOverride ??
    (rotationChoir !== null && choirGroup !== rotationChoir);
  const createdAt = Date.now();
  const defaultSlots: PlanSongSlot[] = getDefaultServiceSlotsFromSettings(
    settings,
  ).map((slotType, index) => ({
    id: `slot-${createdAt}-${index}`,
    sortOrder: index + 1,
    slotType,
    assignments: 'All',
  }));

  const practicesInput =
    input.practices && input.practices.length > 0
      ? input.practices
      : fromSettings.practices;
  const practices: PlanPractice[] =
    practicesInput.length > 0
      ? practicesInput.map((practice, index) => ({
          id: practice.id || `practice-${createdAt}-${index}`,
          date: practice.date,
          startTime: practice.startTime,
          endTime: practice.endTime,
          location: practice.location || input.practiceLocation,
        }))
      : [
          {
            id: `practice-${createdAt}`,
            date: input.practiceDate || fromSettings.practiceDate,
            startTime: input.practiceStartTime || fromSettings.practiceStartTime,
            endTime: input.practiceEndTime || fromSettings.practiceEndTime,
            location: input.practiceLocation,
          },
        ];

  const planBase: Omit<ServiceMusicPlan, 'sentAt'> = {
    id: `plan-${createdAt}`,
    title,
    serviceDate,
    churchEventId,
    sundayServiceId: input.sundayServiceId,
    choirGroup,
    sundayOfMonth: sundayOfMonth ?? undefined,
    scheduleOverride,
    scheduleNote: input.scheduleNote,
    serviceStartTime: input.serviceStartTime || fromSettings.serviceStartTime,
    serviceEndTime: input.serviceEndTime || fromSettings.serviceEndTime,
    occasion: input.occasion,
    attire: input.attire,
    arrivalTime: input.arrivalTime,
    scriptureReader: input.scriptureReader,
    prayerLeader: input.prayerLeader,
    directorNotes: input.directorNotes,
    postServiceMessage: input.postServiceMessage,
    status: 'draft',
    directorName: getDefaultDirectorName(choirGroup, people, rotationConfig),
    songs: defaultSlots,
  };
  const plan = withSyncedPractices(planBase as ServiceMusicPlan, practices);

  const created = await createPlan(plan);
  revalidateMusicPaths(created.id);

  return { ok: true as const, plan: created };
}

export async function savePlanAction(plan: ServiceMusicPlan) {
  const allowed = await guardPermission('music.plans.edit');
  if (!allowed.ok) return allowed;

  const session = await requireSession();
  const access = getMusicAccess(session.roles);
  const existing = await getPlanById(plan.id);
  if (!existing) return { ok: false as const, error: 'Plan not found.' };

  const [choirs, person] = await Promise.all([
    listChoirs(),
    getPersonByEmail(session.email),
  ]);
  const scopeOptions = {
    seeAll: access.canManageRotation,
    fallbackChoirIds: ledChoirIdsForPerson(choirs, person?.id),
  };
  const canEditExisting = canPlanForChoir(
    { roles: session.roles, choirIds: session.choirIds },
    existing.choirGroup,
    scopeOptions,
  );
  const canEditTarget = canPlanForChoir(
    { roles: session.roles, choirIds: session.choirIds },
    plan.choirGroup,
    scopeOptions,
  );
  if (!canEditExisting || !canEditTarget) {
    return {
      ok: false as const,
      error: 'You can only edit plans for choirs assigned to your account.',
    };
  }

  // Preserve send status — directors may revise a plan after it was sent.
  const saved = await updatePlan({
    ...plan,
    status: existing.status,
    sentAt: existing.sentAt,
  });
  if (!saved) return { ok: false as const, error: 'Plan not found.' };

  if (existing.status === 'sent') {
    const session = await requireSession();
    const recipientUserIds = await listChoirPlanNotifyUserIds(
      saved.choirGroup,
      session.id,
    );
    await notify({
      topic: 'music.plan.updated',
      actorUserId: session.id,
      recipientUserIds,
      title: `Choir plan updated: ${saved.title}`,
      body: `${saved.title} was updated. Open the app to see the latest songs and details.`,
      href: `/music/plans/${saved.id}/rehearse`,
      payload: { planId: saved.id },
    });
  }

  revalidateMusicPaths(plan.id);

  return { ok: true as const, plan: saved };
}

async function loadEditablePlan(
  planId: string,
): Promise<
  | { ok: true; plan: ServiceMusicPlan }
  | { ok: false; error: string }
> {
  const allowed = await guardPermission('music.plans.edit');
  if (!allowed.ok) return allowed;

  const plan = await getPlanById(planId);
  if (!plan) return { ok: false, error: 'Plan not found.' };
  return { ok: true, plan };
}

function reindexSlots(slots: PlanSongSlot[]): PlanSongSlot[] {
  return slots.map((slot, index) => ({ ...slot, sortOrder: index + 1 }));
}

/** Add an empty service slot (song can be assigned later). */
export async function addPlanSlotAction(
  planId: string,
  input: { slotType: PlanSongSlotType; assignments?: string },
) {
  const loaded = await loadEditablePlan(planId);
  if (!loaded.ok) return loaded;

  const slot: PlanSongSlot = {
    id: `slot-${Date.now()}-${loaded.plan.songs.length}`,
    sortOrder: loaded.plan.songs.length + 1,
    slotType: input.slotType,
    assignments: input.assignments?.trim() || 'All',
  };

  const saved = await updatePlan({
    ...loaded.plan,
    songs: [...loaded.plan.songs, slot],
  });
  if (!saved) return { ok: false as const, error: 'Could not save plan.' };

  revalidateMusicPaths(planId);
  return { ok: true as const, plan: saved };
}

/** Seed empty slots from director settings when the set list is empty. */
export async function addStandardPlanSlotsAction(planId: string) {
  const loaded = await loadEditablePlan(planId);
  if (!loaded.ok) return loaded;

  if (loaded.plan.songs.length > 0) {
    return {
      ok: false as const,
      error: 'Clear existing slots first, or add slots one at a time.',
    };
  }

  const settings = await getChoirDirectorSettings();
  const slotTypes = getDefaultServiceSlotsFromSettings(settings);
  const slots: PlanSongSlot[] = slotTypes.map((slotType, index) => ({
    id: `slot-${Date.now()}-${index}`,
    sortOrder: index + 1,
    slotType,
    assignments: 'All',
  }));

  const saved = await updatePlan({ ...loaded.plan, songs: slots });
  if (!saved) return { ok: false as const, error: 'Could not save plan.' };

  revalidateMusicPaths(planId);
  return { ok: true as const, plan: saved };
}

export async function updatePlanSlotAction(
  planId: string,
  slotId: string,
  input: {
    slotType?: PlanSongSlotType;
    assignments?: string;
    songId?: string | null;
    customTitle?: string | null;
  },
) {
  const loaded = await loadEditablePlan(planId);
  if (!loaded.ok) return loaded;

  const index = loaded.plan.songs.findIndex((slot) => slot.id === slotId);
  if (index < 0) return { ok: false as const, error: 'Slot not found.' };

  const current = loaded.plan.songs[index]!;
  const next: PlanSongSlot = {
    ...current,
    slotType: input.slotType ?? current.slotType,
    assignments:
      input.assignments !== undefined
        ? input.assignments.trim() || 'All'
        : current.assignments,
  };

  if (input.songId !== undefined) {
    next.songId = input.songId?.trim() || undefined;
    if (input.songId) next.customTitle = undefined;
  }
  if (input.customTitle !== undefined) {
    next.customTitle = input.customTitle?.trim() || undefined;
    if (input.customTitle?.trim()) next.songId = undefined;
  }

  const songs = [...loaded.plan.songs];
  songs[index] = next;

  const saved = await updatePlan({ ...loaded.plan, songs });
  if (!saved) return { ok: false as const, error: 'Could not save plan.' };

  revalidateMusicPaths(planId);
  return { ok: true as const, plan: saved };
}

/** @deprecated Prefer addPlanSlotAction + updatePlanSlotAction. */
export async function addPlanSongAction(
  planId: string,
  input: {
    songId?: string;
    customTitle?: string;
    slotType: PlanSongSlotType;
    assignments?: string;
  },
) {
  const created = await addPlanSlotAction(planId, {
    slotType: input.slotType,
    assignments: input.assignments,
  });
  if (!created.ok) return created;

  const slot = created.plan.songs[created.plan.songs.length - 1];
  if (!slot) return { ok: false as const, error: 'Could not create slot.' };

  return updatePlanSlotAction(planId, slot.id, {
    songId: input.songId ?? null,
    customTitle: input.customTitle ?? null,
  });
}

export async function removePlanSlotAction(planId: string, slotId: string) {
  const loaded = await loadEditablePlan(planId);
  if (!loaded.ok) return loaded;

  const songs = reindexSlots(
    loaded.plan.songs.filter((slot) => slot.id !== slotId),
  );

  const saved = await updatePlan({ ...loaded.plan, songs });
  if (!saved) return { ok: false as const, error: 'Could not save plan.' };

  revalidateMusicPaths(planId);
  return { ok: true as const, plan: saved };
}

export async function removePlanSongAction(planId: string, slotId: string) {
  return removePlanSlotAction(planId, slotId);
}

export async function generateRepertoireCoachAction(): Promise<
  | { ok: true; guidance: string; generatedAt: string }
  | { ok: false; error: string }
> {
  const allowed = await guardPermission('music.plans.edit');
  if (!allowed.ok) return allowed;

  return generateRepertoireCoachGuidance();
}

export async function suggestPlanSetListAction(
  planId: string,
): Promise<
  | { ok: true; suggestion: SetListSuggestion; generatedAt: string }
  | { ok: false; error: string }
> {
  const allowed = await guardPermission('music.plans.edit');
  if (!allowed.ok) return allowed;

  return suggestPlanSetList(planId);
}

const applySetListSuggestionsSchema = z.object({
  planId: z.string().min(1),
  onlyEmpty: z.boolean().optional(),
  slots: z
    .array(
      z.object({
        slotId: z.string().min(1),
        songId: z.string().min(1),
      }),
    )
    .min(1),
});

export async function applyPlanSetListSuggestionsAction(input: {
  planId: string;
  slots: { slotId: string; songId: string }[];
  /** When true, skip slots that already have a song or custom title. */
  onlyEmpty?: boolean;
}): Promise<
  | { ok: true; plan: ServiceMusicPlan; appliedCount: number }
  | { ok: false; error: string }
> {
  const allowed = await guardPermission('music.plans.edit');
  if (!allowed.ok) return allowed;

  const parsed = applySetListSuggestionsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid suggestions.',
    };
  }

  const loaded = await loadEditablePlan(parsed.data.planId);
  if (!loaded.ok) return loaded;

  const onlyEmpty = parsed.data.onlyEmpty ?? true;
  const bySlotId = new Map(
    parsed.data.slots.map((item) => [item.slotId, item.songId]),
  );
  let appliedCount = 0;

  const songs = loaded.plan.songs.map((slot) => {
    const songId = bySlotId.get(slot.id);
    if (!songId) return slot;

    const hasSong = Boolean(slot.songId || slot.customTitle?.trim());
    if (onlyEmpty && hasSong) return slot;

    appliedCount += 1;
    return {
      ...slot,
      songId,
      customTitle: undefined,
    };
  });

  if (appliedCount === 0) {
    return {
      ok: false,
      error: onlyEmpty
        ? 'No empty slots to fill. Turn off “only empty” to replace songs.'
        : 'No matching slots to update.',
    };
  }

  const saved = await updatePlan({ ...loaded.plan, songs });
  if (!saved) return { ok: false, error: 'Could not save plan.' };

  revalidateMusicPaths(parsed.data.planId);
  return { ok: true, plan: saved, appliedCount };
}
