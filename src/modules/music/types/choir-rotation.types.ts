import type { ChoirGroup, ChoirLeader, SundayOfMonth } from './music.types';
import { DEFAULT_CHOIR_BY_SUNDAY } from './music.types';
import { DEFAULT_CHOIR_SEED } from './choir.types';

export type ChoirRotationConfig = {
  defaultBySunday: Record<SundayOfMonth, ChoirGroup>;
  leadersByGroup: Record<string, ChoirLeader[]>;
};

function leadersFromSeed(): Record<string, ChoirLeader[]> {
  const map: Record<string, ChoirLeader[]> = {};
  for (const choir of DEFAULT_CHOIR_SEED) {
    map[choir.id] = [...choir.leaders];
  }
  return map;
}

export const DEFAULT_CHOIR_ROTATION_CONFIG: ChoirRotationConfig = {
  defaultBySunday: { ...DEFAULT_CHOIR_BY_SUNDAY },
  leadersByGroup: leadersFromSeed(),
};
