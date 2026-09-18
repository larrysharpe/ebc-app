'use server';

import { revalidatePath } from 'next/cache';

import {
  PermissionDeniedError,
  requirePermission,
} from '@/modules/auth/services/auth.service';

import { upsertChoirDirectorSettings } from '../repository/director-settings.repository';
import { choirDirectorSettingsSchema } from '../schemas/director-settings.schemas';
import type {
  ChoirDirectorSettings,
  DefaultPracticeTemplate,
  PracticeWeekday,
} from '../types/director-settings.types';
import type { PlanSongSlotType } from '../types';
import { withSyncedLegacyPracticeFields } from '../utils/director-settings.utils';

async function guardEdit(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requirePermission('music.plans.edit');
    return { ok: true };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return { ok: false, error: 'You do not have permission for this action.' };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

export async function saveChoirDirectorSettingsAction(input: {
  defaultChoirGroup: string;
  serviceStartTime: string;
  serviceEndTime: string;
  practiceWeekday?: number;
  practiceStartTime?: string;
  practiceEndTime?: string;
  defaultPractices: DefaultPracticeTemplate[];
  defaultServiceSlots: PlanSongSlotType[];
}): Promise<
  | { ok: true; settings: ChoirDirectorSettings }
  | { ok: false; error: string }
> {
  const allowed = await guardEdit();
  if (!allowed.ok) return allowed;

  const parsed = choirDirectorSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid settings.',
    };
  }

  if (parsed.data.serviceEndTime <= parsed.data.serviceStartTime) {
    return { ok: false, error: 'Service end time must be after start time.' };
  }

  for (const practice of parsed.data.defaultPractices) {
    if (practice.endTime <= practice.startTime) {
      return {
        ok: false,
        error: 'Each practice end time must be after its start time.',
      };
    }
  }

  const settings = await upsertChoirDirectorSettings(
    withSyncedLegacyPracticeFields({
      defaultChoirGroup: parsed.data.defaultChoirGroup,
      serviceStartTime: parsed.data.serviceStartTime,
      serviceEndTime: parsed.data.serviceEndTime,
      practiceWeekday: parsed.data.practiceWeekday as PracticeWeekday | undefined,
      practiceStartTime: parsed.data.practiceStartTime,
      practiceEndTime: parsed.data.practiceEndTime,
      defaultPractices: parsed.data.defaultPractices.map((practice) => ({
        id: practice.id,
        weekday: practice.weekday as PracticeWeekday,
        weeksBefore: practice.weeksBefore,
        startTime: practice.startTime,
        endTime: practice.endTime,
        location: practice.location,
      })),
      defaultServiceSlots: parsed.data.defaultServiceSlots,
    }),
  );

  revalidatePath('/music');
  revalidatePath('/music/director-settings');
  revalidatePath('/music/plans/new');
  revalidatePath('/music/plans');

  return { ok: true, settings };
}
