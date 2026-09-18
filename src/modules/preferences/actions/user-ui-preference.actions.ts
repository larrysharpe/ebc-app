'use server';

import { revalidatePath } from 'next/cache';

import { updateVoiceCoachPreferenceSchema } from '../schemas/user-ui-preference.schemas';
import {
  getUserUiPreferencesForSession,
  saveVoiceCoachPreferenceForSession,
} from '../services/user-ui-preference.service';
import type { UserUiPreferences } from '../types/user-ui-preference.types';

export async function getUserUiPreferencesAction(): Promise<
  { ok: true; preferences: UserUiPreferences } | { ok: false; error: string }
> {
  return getUserUiPreferencesForSession();
}

export async function updateVoiceCoachPreferenceAction(
  raw: unknown,
): Promise<
  { ok: true; preferences: UserUiPreferences } | { ok: false; error: string }
> {
  const parsed = updateVoiceCoachPreferenceSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid preference.',
    };
  }
  const result = await saveVoiceCoachPreferenceForSession(parsed.data);
  if (result.ok) {
    revalidatePath('/account/preferences');
    revalidatePath('/events');
  }
  return result;
}
