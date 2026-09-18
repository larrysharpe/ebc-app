import 'server-only';

import { prisma } from '@/lib/db';

import {
  defaultUserUiPreferences,
  isVoiceCoachPreference,
  type UserUiPreferences,
  type VoiceCoachPreference,
} from '../types/user-ui-preference.types';

function mapRow(row: {
  voiceCoachPreference: string;
}): UserUiPreferences {
  return {
    voiceCoachPreference: isVoiceCoachPreference(row.voiceCoachPreference)
      ? row.voiceCoachPreference
      : 'ask',
  };
}

export async function getUserUiPreferences(
  userId: string,
): Promise<UserUiPreferences> {
  const row = await prisma.userUiPreference.findUnique({
    where: { userId },
  });
  if (!row) return defaultUserUiPreferences();
  return mapRow(row);
}

export async function upsertVoiceCoachPreference(
  userId: string,
  voiceCoachPreference: VoiceCoachPreference,
): Promise<UserUiPreferences> {
  const row = await prisma.userUiPreference.upsert({
    where: { userId },
    create: {
      userId,
      voiceCoachPreference,
    },
    update: {
      voiceCoachPreference,
    },
  });
  return mapRow(row);
}
