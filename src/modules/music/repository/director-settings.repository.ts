import { prisma } from '@/lib/db';

import {
  DEFAULT_CHOIR_DIRECTOR_SETTINGS,
  type ChoirDirectorSettings,
  type DefaultPracticeTemplate,
  type PracticeWeekday,
} from '../types/director-settings.types';
import type { ChoirGroup, PlanSongSlotType } from '../types';
import { SLOT_TYPE_LABELS } from '../types';
import {
  normalizeDefaultPractices,
  normalizeDefaultServiceSlots,
  withSyncedLegacyPracticeFields,
} from '../utils/director-settings.utils';

const SETTINGS_ID = 'default';

const SLOT_TYPE_SET = new Set(Object.keys(SLOT_TYPE_LABELS));

function parseDefaultServiceSlots(value: unknown): PlanSongSlotType[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_CHOIR_DIRECTOR_SETTINGS.defaultServiceSlots];
  }
  const slots = value.filter(
    (item): item is PlanSongSlotType =>
      typeof item === 'string' && SLOT_TYPE_SET.has(item),
  );
  return normalizeDefaultServiceSlots(slots);
}

function parseDefaultPractices(
  value: unknown,
  legacy: {
    practiceWeekday: number;
    practiceStartTime: string;
    practiceEndTime: string;
  },
): DefaultPracticeTemplate[] {
  const raw = Array.isArray(value) ? (value as DefaultPracticeTemplate[]) : [];
  return normalizeDefaultPractices(raw, {
    practiceWeekday: legacy.practiceWeekday as PracticeWeekday,
    practiceStartTime: legacy.practiceStartTime,
    practiceEndTime: legacy.practiceEndTime,
  });
}

function mapRow(row: {
  defaultChoirGroup: string;
  serviceStartTime: string;
  serviceEndTime: string;
  practiceWeekday: number;
  practiceStartTime: string;
  practiceEndTime: string;
  defaultPractices: unknown;
  defaultServiceSlots: unknown;
}): ChoirDirectorSettings {
  const defaultPractices = parseDefaultPractices(row.defaultPractices, {
    practiceWeekday: row.practiceWeekday,
    practiceStartTime: row.practiceStartTime,
    practiceEndTime: row.practiceEndTime,
  });
  const first = defaultPractices[0];

  return {
    defaultChoirGroup: row.defaultChoirGroup as ChoirGroup,
    serviceStartTime: row.serviceStartTime,
    serviceEndTime: row.serviceEndTime,
    practiceWeekday: (first?.weekday ?? row.practiceWeekday) as PracticeWeekday,
    practiceStartTime: first?.startTime ?? row.practiceStartTime,
    practiceEndTime: first?.endTime ?? row.practiceEndTime,
    defaultPractices,
    defaultServiceSlots: parseDefaultServiceSlots(row.defaultServiceSlots),
  };
}

export async function getChoirDirectorSettings(): Promise<ChoirDirectorSettings> {
  const row = await prisma.choirDirectorSettings.findUnique({
    where: { id: SETTINGS_ID },
  });
  if (!row) return { ...DEFAULT_CHOIR_DIRECTOR_SETTINGS };
  return mapRow(row);
}

export async function upsertChoirDirectorSettings(
  settings: ChoirDirectorSettings,
): Promise<ChoirDirectorSettings> {
  const synced = withSyncedLegacyPracticeFields(settings);

  const row = await prisma.choirDirectorSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      defaultChoirGroup: synced.defaultChoirGroup,
      serviceStartTime: synced.serviceStartTime,
      serviceEndTime: synced.serviceEndTime,
      practiceWeekday: synced.practiceWeekday,
      practiceStartTime: synced.practiceStartTime,
      practiceEndTime: synced.practiceEndTime,
      defaultPractices: synced.defaultPractices,
      defaultServiceSlots: synced.defaultServiceSlots,
    },
    update: {
      defaultChoirGroup: synced.defaultChoirGroup,
      serviceStartTime: synced.serviceStartTime,
      serviceEndTime: synced.serviceEndTime,
      practiceWeekday: synced.practiceWeekday,
      practiceStartTime: synced.practiceStartTime,
      practiceEndTime: synced.practiceEndTime,
      defaultPractices: synced.defaultPractices,
      defaultServiceSlots: synced.defaultServiceSlots,
    },
  });
  return mapRow(row);
}
