import { getChurchSpaceById } from '@/modules/facilities/repositories/church-space.repository';
import { formatChurchSpaceLabel } from '@/modules/facilities/utils/church-space.utils';

import {
  listChurchEventsForSpaceConflict,
} from '../repositories/church-event.repository';
import {
  findSpaceConflicts,
  formatSpaceConflictMessage,
  type SpaceConflictHit,
} from '../utils/space-conflict.utils';

export type CheckSpaceConflictInput = {
  spaceId: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  excludeEventId?: string;
  dates?: readonly string[];
};

export type SpaceConflictResult = {
  conflicts: SpaceConflictHit[];
  message: string | null;
  spaceLabel: string;
};

export async function checkChurchSpaceConflicts(
  input: CheckSpaceConflictInput,
): Promise<SpaceConflictResult> {
  const spaceId = input.spaceId.trim();
  const space = await getChurchSpaceById(spaceId);
  const spaceLabel = space
    ? formatChurchSpaceLabel(space)
    : 'That room';

  const dates =
    input.dates && input.dates.length > 0
      ? [...new Set(input.dates.filter(Boolean))]
      : input.eventDate.trim()
        ? [input.eventDate.trim()]
        : [];

  if (!spaceId || dates.length === 0) {
    return { conflicts: [], message: null, spaceLabel };
  }

  const candidates = await listChurchEventsForSpaceConflict({
    spaceId,
    locationLabel: space ? formatChurchSpaceLabel(space) : undefined,
    dates,
  });

  const conflicts = dates.flatMap((eventDate) =>
    findSpaceConflicts({
      spaceId,
      eventDate,
      startTime: input.startTime,
      endTime: input.endTime,
      excludeEventId: input.excludeEventId,
      candidates,
    }),
  );

  // Dedupe by id (recurring checks across dates shouldn't duplicate same id)
  const unique = [...new Map(conflicts.map((hit) => [hit.id, hit])).values()];

  return {
    conflicts: unique,
    message:
      unique.length > 0
        ? formatSpaceConflictMessage(unique, spaceLabel)
        : null,
    spaceLabel,
  };
}
