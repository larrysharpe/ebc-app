import type { ChoirGroup, ChoirLeader, ChoirScheduleRow, SundayOfMonth } from '../types';
import { DEFAULT_CHOIR_BY_SUNDAY } from '../types';
import type { ChoirRotationConfig } from '../types/choir-rotation.types';
import { DEFAULT_CHOIR_ROTATION_CONFIG } from '../types/choir-rotation.types';
import { DEFAULT_CHOIR_SEED } from '../types/choir.types';
import { parseChoirLeader } from './person-refs.utils';

const SUNDAYS: SundayOfMonth[] = [1, 2, 3, 4, 5];

function leadersFromSeed(): Record<string, ChoirLeader[]> {
  const map: Record<string, ChoirLeader[]> = {};
  for (const choir of DEFAULT_CHOIR_SEED) {
    map[choir.id] = [...choir.leaders];
  }
  return map;
}

export function parseChoirRotationConfig(
  defaultRotationBySunday: unknown,
  leadersByGroup: unknown,
): ChoirRotationConfig {
  const defaultBySunday: Record<SundayOfMonth, ChoirGroup> = {
    ...DEFAULT_CHOIR_BY_SUNDAY,
  };

  if (defaultRotationBySunday && typeof defaultRotationBySunday === 'object') {
    const map = defaultRotationBySunday as Record<string, unknown>;
    for (const sunday of SUNDAYS) {
      const value = map[String(sunday)] ?? map[sunday as unknown as string];
      if (typeof value === 'string' && value.trim()) {
        defaultBySunday[sunday] = value;
      }
    }
  }

  const leaders: Record<string, ChoirLeader[]> = leadersFromSeed();

  if (leadersByGroup && typeof leadersByGroup === 'object') {
    const map = leadersByGroup as Record<string, unknown>;
    for (const [group, list] of Object.entries(map)) {
      if (!Array.isArray(list)) continue;
      const parsed = list
        .map(parseChoirLeader)
        .filter((item): item is ChoirLeader => item !== null);
      if (parsed.length > 0) {
        leaders[group] = parsed;
      }
    }
  }

  return { defaultBySunday, leadersByGroup: leaders };
}

export function buildScheduleRows(config: ChoirRotationConfig): ChoirScheduleRow[] {
  return SUNDAYS.map((sunday) => ({
    sunday,
    choirGroup: config.defaultBySunday[sunday],
    leaders: config.leadersByGroup[config.defaultBySunday[sunday]] ?? [],
  }));
}

export function getDefaultChoirForSundayFromConfig(
  sunday: SundayOfMonth,
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): ChoirGroup {
  return config.defaultBySunday[sunday];
}

export function getLeadersForChoirGroupFromConfig(
  choirGroup: ChoirGroup,
  config: ChoirRotationConfig = DEFAULT_CHOIR_ROTATION_CONFIG,
): ChoirLeader[] {
  return config.leadersByGroup[choirGroup] ?? [];
}
