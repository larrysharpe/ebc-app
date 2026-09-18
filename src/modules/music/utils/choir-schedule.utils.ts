import type { Person } from '@/modules/members/types/person.types';

import type {
  ChoirGroup,
  ChoirLeader,
  ChoirScheduleOverride,
  ServiceMusicPlan,
  SundayOfMonth,
} from '../types';
import type { ChoirRotationConfig } from '../types/choir-rotation.types';
import { DEFAULT_CHOIR_ROTATION_CONFIG } from '../types/choir-rotation.types';
import { getChoirName } from './choir.utils';
import {
  getDefaultChoirForSundayFromConfig,
  getLeadersForChoirGroupFromConfig,
} from './choir-rotation.utils';
import { formatLeadersList, peopleByIdMap } from './person-refs.utils';

/** Which occurrence of Sunday in the month (1–5). Returns null if not a Sunday. */
export function getSundayOfMonth(isoDate: string): SundayOfMonth | null {
  const date = new Date(`${isoDate}T12:00:00`);
  if (date.getDay() !== 0) return null;

  const day = date.getDate();
  const occurrence = Math.ceil(day / 7) as SundayOfMonth;
  return occurrence >= 1 && occurrence <= 5 ? occurrence : null;
}

export function getDefaultChoirForSunday(
  sunday: SundayOfMonth,
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): ChoirGroup {
  return getDefaultChoirForSundayFromConfig(sunday, config);
}

export function getDefaultChoirForDate(
  isoDate: string,
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): ChoirGroup | null {
  const sunday = getSundayOfMonth(isoDate);
  if (!sunday) return null;
  return getDefaultChoirForSunday(sunday, config);
}

/** Which Sunday-of-month slot a choir normally sings. */
export function getDefaultSundayForChoir(
  choirGroup: ChoirGroup,
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): SundayOfMonth {
  const match = (
    Object.entries(config.defaultBySunday) as [string, ChoirGroup][]
  ).find(([, group]) => group === choirGroup);
  return match ? (Number(match[0]) as SundayOfMonth) : 1;
}

/** ISO date for the Nth Sunday of a calendar month, or null if that month has no Nth Sunday. */
export function getNthSundayOfMonth(
  year: number,
  monthIndex: number,
  n: SundayOfMonth,
): string | null {
  const firstOfMonth = new Date(year, monthIndex, 1, 12, 0, 0);
  const offsetToSunday = (7 - firstOfMonth.getDay()) % 7;
  const day = 1 + offsetToSunday + (n - 1) * 7;
  const date = new Date(year, monthIndex, day, 12, 0, 0);
  if (date.getMonth() !== monthIndex) return null;
  return date.toISOString().slice(0, 10);
}

/**
 * Next service date for a choir's default rotation Sunday (on or after fromIso).
 * Searches up to 24 months ahead (needed for 5th-Sunday choirs).
 */
export function getNextServiceDateForChoir(
  choirGroup: ChoirGroup,
  fromIso: string = new Date().toISOString().slice(0, 10),
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): string {
  const sundayOfMonth = getDefaultSundayForChoir(choirGroup, config);
  const from = fromIso.slice(0, 10);
  const start = new Date(`${from}T12:00:00`);
  if (Number.isNaN(start.getTime())) {
    return from;
  }

  let year = start.getFullYear();
  let monthIndex = start.getMonth();

  for (let i = 0; i < 24; i += 1) {
    const iso = getNthSundayOfMonth(year, monthIndex, sundayOfMonth);
    if (iso && iso >= from) return iso;
    monthIndex += 1;
    if (monthIndex > 11) {
      monthIndex = 0;
      year += 1;
    }
  }

  return from;
}

export function resolveChoirForDate(
  isoDate: string,
  overrides: ChoirScheduleOverride[] = [],
  plans: ServiceMusicPlan[] = [],
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): {
  choirGroup: ChoirGroup | null;
  sundayOfMonth: SundayOfMonth | null;
  isOverride: boolean;
  scheduleNote?: string;
  source: 'plan' | 'override' | 'default' | 'none';
} {
  const sunday = getSundayOfMonth(isoDate);

  const plan = plans.find((p) => p.serviceDate === isoDate);
  if (plan) {
    return {
      choirGroup: plan.choirGroup,
      sundayOfMonth: plan.sundayOfMonth ?? sunday,
      isOverride: plan.scheduleOverride ?? false,
      scheduleNote: plan.scheduleNote,
      source: 'plan',
    };
  }

  const override = overrides.find((o) => o.serviceDate === isoDate);
  if (override) {
    return {
      choirGroup: override.choirGroup,
      sundayOfMonth: override.sundayOfMonth,
      isOverride: true,
      scheduleNote: override.note,
      source: 'override',
    };
  }

  if (sunday) {
    return {
      choirGroup: getDefaultChoirForSunday(sunday, config),
      sundayOfMonth: sunday,
      isOverride: false,
      source: 'default',
    };
  }

  return { choirGroup: null, sundayOfMonth: null, isOverride: false, source: 'none' };
}

export function formatSundayLabel(sunday: SundayOfMonth): string {
  const suffixes: Record<SundayOfMonth, string> = {
    1: 'st',
    2: 'nd',
    3: 'rd',
    4: 'th',
    5: 'th',
  };
  return `${sunday}${suffixes[sunday]} Sunday`;
}

export function formatScheduleAssignment(
  choirGroup: ChoirGroup,
  sundayOfMonth: SundayOfMonth | null,
  isOverride?: boolean,
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): string {
  const name = getChoirName(choirGroup);
  if (!sundayOfMonth) return name;
  const defaultChoir = getDefaultChoirForSunday(sundayOfMonth, config);
  if (isOverride && defaultChoir !== choirGroup) {
    return `${name} (${formatSundayLabel(sundayOfMonth)} — swapped)`;
  }
  return `${name} (${formatSundayLabel(sundayOfMonth)})`;
}

export {
  formatLeaderName,
  formatLeadersList,
} from './person-refs.utils';

export function getLeadersForChoirGroup(
  choirGroup: ChoirGroup,
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): ChoirLeader[] {
  return getLeadersForChoirGroupFromConfig(choirGroup, config);
}

export function getLeadersForSunday(
  sunday: SundayOfMonth,
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): ChoirLeader[] {
  const group = getDefaultChoirForSunday(sunday, config);
  return getLeadersForChoirGroup(group, config);
}

export function getDefaultDirectorName(
  choirGroup: ChoirGroup,
  people: readonly Person[] = [],
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): string {
  const leaders = getLeadersForChoirGroup(choirGroup, config);
  const formatted = formatLeadersList(leaders, peopleByIdMap(people));
  return formatted || getChoirName(choirGroup);
}

export const LEGACY_CHOIR_GROUP_MAP: Record<string, ChoirGroup> = {
  '2nd_sunday_chapel': 'youth',
  male_chorus: 'mens',
  general: 'adult',
};
