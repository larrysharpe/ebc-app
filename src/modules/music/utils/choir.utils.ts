import type { ChoirGroup, ChoirScheduleRow, SundayOfMonth } from '../types';
import { CHOIR_GROUP_LABELS } from '../types';
import { isCombinedChoir, type Choir } from '../types/choir.types';

export function getChoirName(choirId: string, choirs: readonly Choir[] = []): string {
  const match = choirs.find((choir) => choir.id === choirId);
  if (match) return match.name;
  return CHOIR_GROUP_LABELS[choirId] ?? choirId;
}

export function buildChoirLabels(choirs: readonly Choir[]): Record<string, string> {
  const labels: Record<string, string> = { ...CHOIR_GROUP_LABELS };
  for (const choir of choirs) {
    labels[choir.id] = choir.name;
  }
  return labels;
}

export function getActiveChoirs(choirs: readonly Choir[]): Choir[] {
  return choirs.filter((choir) => choir.active);
}

/** Standing chapel choirs for the monthly Sunday rotation (excludes Combined). */
export function getRotationChoirs(choirs: readonly Choir[]): Choir[] {
  return getActiveChoirs(choirs).filter((choir) => !isCombinedChoir(choir.id));
}

export function getChoirForSunday(
  sunday: SundayOfMonth,
  choirs: readonly Choir[],
): Choir | undefined {
  return choirs.find((choir) => choir.active && choir.defaultSunday === sunday);
}

export function buildScheduleRowsFromChoirs(
  choirs: readonly Choir[],
): ChoirScheduleRow[] {
  const sundays: SundayOfMonth[] = [1, 2, 3, 4, 5];
  return sundays.map((sunday) => {
    const choir = getChoirForSunday(sunday, choirs);
    return {
      sunday,
      choirGroup: (choir?.id ?? '') as ChoirGroup,
      leaders: choir?.leaders ?? [],
    };
  });
}

export function slugifyChoirName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48);
}
