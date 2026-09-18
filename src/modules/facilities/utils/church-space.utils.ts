import {
  CHURCH_FLOOR_LABELS,
  type ChurchSpaceSeed,
} from '@/modules/facilities/constants/church-space.constants';
import type {
  ChurchFloor,
  ChurchSpace,
  ChurchSpaceOption,
} from '@/modules/facilities/types/church-space.types';

export function isChurchFloor(value: string): value is ChurchFloor {
  return value === 'first' || value === 'second' || value === 'third';
}

export function formatChurchSpaceLabel(
  space: Pick<ChurchSpaceSeed | ChurchSpace | ChurchSpaceOption, 'floor' | 'name'>,
): string {
  return `${space.name} (${CHURCH_FLOOR_LABELS[space.floor]})`;
}

export function toChurchSpaceOption(
  space: Pick<ChurchSpace, 'id' | 'floor' | 'name' | 'active'>,
): ChurchSpaceOption {
  return {
    id: space.id,
    floor: space.floor,
    name: space.name,
    label: formatChurchSpaceLabel(space),
    active: space.active,
  };
}

export function groupSpacesByFloor<T extends { floor: ChurchFloor; sortOrder?: number; name: string }>(
  spaces: readonly T[],
): Record<ChurchFloor, T[]> {
  const groups: Record<ChurchFloor, T[]> = {
    first: [],
    second: [],
    third: [],
  };

  for (const space of spaces) {
    groups[space.floor].push(space);
  }

  for (const floor of Object.keys(groups) as ChurchFloor[]) {
    groups[floor].sort((a, b) => {
      const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name);
    });
  }

  return groups;
}

/** Match a stored location string to a space option label. */
export function findSpaceOptionByLocation(
  location: string | undefined,
  options: readonly ChurchSpaceOption[],
): ChurchSpaceOption | undefined {
  const trimmed = location?.trim();
  if (!trimmed) return undefined;
  return options.find((option) => option.label === trimmed || option.name === trimmed);
}
