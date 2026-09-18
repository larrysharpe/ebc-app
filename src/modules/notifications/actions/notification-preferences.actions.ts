'use server';

import { revalidatePath } from 'next/cache';

import {
  saveChannelPreferenceForSession,
  saveTopicPreferenceForSession,
} from '../services/notification-preferences.service';
import {
  updateChannelPreferenceSchema,
  updateTopicPreferenceSchema,
} from '../schemas/notification-preferences.schemas';

export async function updateChannelPreferenceAction(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = updateChannelPreferenceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid settings.' };
  }
  const result = await saveChannelPreferenceForSession(parsed.data);
  if (result.ok) revalidatePath('/account/notifications');
  return result;
}

export async function updateTopicPreferenceAction(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = updateTopicPreferenceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid settings.' };
  }
  const result = await saveTopicPreferenceForSession(parsed.data);
  if (result.ok) revalidatePath('/account/notifications');
  return result;
}
