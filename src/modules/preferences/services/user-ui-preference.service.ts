import 'server-only';

import { requireSession } from '@/modules/auth/services/auth.service';

import {
  getUserUiPreferences,
  upsertVoiceCoachPreference,
} from '../repositories/user-ui-preference.repository';
import type { UpdateVoiceCoachPreferenceInput } from '../schemas/user-ui-preference.schemas';
import type { UserUiPreferences } from '../types/user-ui-preference.types';

export async function getUserUiPreferencesForSession(): Promise<
  { ok: true; preferences: UserUiPreferences } | { ok: false; error: string }
> {
  try {
    const session = await requireSession();
    const preferences = await getUserUiPreferences(session.id);
    return { ok: true, preferences };
  } catch {
    return { ok: false, error: 'Sign in to load preferences.' };
  }
}

export async function saveVoiceCoachPreferenceForSession(
  input: UpdateVoiceCoachPreferenceInput,
): Promise<
  { ok: true; preferences: UserUiPreferences } | { ok: false; error: string }
> {
  try {
    const session = await requireSession();
    const preferences = await upsertVoiceCoachPreference(
      session.id,
      input.voiceCoachPreference,
    );
    return { ok: true, preferences };
  } catch {
    return { ok: false, error: 'Could not save that preference.' };
  }
}
