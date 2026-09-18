import { prisma } from '@/lib/db';

import type { ChoirGroup, ChoirScheduleOverride, SundayOfMonth } from '../types';
import { DEFAULT_CHOIR_BY_SUNDAY } from '../types';
import type { ChoirRotationConfig } from '../types/choir-rotation.types';
import { DEFAULT_CHOIR_ROTATION_CONFIG } from '../types/choir-rotation.types';
import { listChoirs } from './choir.repository';

function mapOverride(row: {
  id: string;
  serviceDate: string;
  choirGroup: string;
  sundayOfMonth: number;
  note: string | null;
}): ChoirScheduleOverride {
  return {
    id: row.id,
    serviceDate: row.serviceDate,
    choirGroup: row.choirGroup as ChoirScheduleOverride['choirGroup'],
    sundayOfMonth: row.sundayOfMonth as ChoirScheduleOverride['sundayOfMonth'],
    note: row.note ?? undefined,
  };
}

/** Builds rotation config from Choir rows (source of truth). */
export async function getChoirRotationConfig(): Promise<ChoirRotationConfig> {
  const choirs = await listChoirs();
  if (choirs.length === 0) return { ...DEFAULT_CHOIR_ROTATION_CONFIG };

  const defaultBySunday: Record<SundayOfMonth, ChoirGroup> = {
    ...DEFAULT_CHOIR_BY_SUNDAY,
  };
  const leadersByGroup: ChoirRotationConfig['leadersByGroup'] = {
    ...DEFAULT_CHOIR_ROTATION_CONFIG.leadersByGroup,
  };

  for (const choir of choirs) {
    leadersByGroup[choir.id] = choir.leaders;
    if (choir.defaultSunday) {
      defaultBySunday[choir.defaultSunday] = choir.id;
    }
  }

  return { defaultBySunday, leadersByGroup };
}

export async function createScheduleOverride(
  override: ChoirScheduleOverride,
): Promise<ChoirScheduleOverride> {
  const row = await prisma.choirScheduleOverride.create({
    data: {
      id: override.id,
      serviceDate: override.serviceDate,
      choirGroup: override.choirGroup,
      sundayOfMonth: override.sundayOfMonth,
      note: override.note ?? null,
    },
  });
  return mapOverride(row);
}

export async function updateScheduleOverride(
  override: ChoirScheduleOverride,
): Promise<ChoirScheduleOverride | null> {
  try {
    const row = await prisma.choirScheduleOverride.update({
      where: { id: override.id },
      data: {
        serviceDate: override.serviceDate,
        choirGroup: override.choirGroup,
        sundayOfMonth: override.sundayOfMonth,
        note: override.note ?? null,
      },
    });
    return mapOverride(row);
  } catch {
    return null;
  }
}

export async function deleteScheduleOverride(id: string): Promise<boolean> {
  try {
    await prisma.choirScheduleOverride.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function getScheduleOverrideById(
  id: string,
): Promise<ChoirScheduleOverride | undefined> {
  const row = await prisma.choirScheduleOverride.findUnique({ where: { id } });
  return row ? mapOverride(row) : undefined;
}
