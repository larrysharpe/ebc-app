import { formatChurchEventDisplayTitle } from '@/modules/events/types/church-event.types';
import type { ChurchEvent } from '@/modules/events/types/church-event.types';
import { intervalsOverlap } from '@/modules/events/utils/event-time-overlap.utils';

export type SpaceConflictCandidate = Pick<
  ChurchEvent,
  'id' | 'title' | 'eventDate' | 'startTime' | 'endTime' | 'status' | 'spaceId' | 'location'
>;

export type SpaceConflictHit = {
  id: string;
  title: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  status: ChurchEvent['status'];
};

export type SpaceConflictCheckInput = {
  spaceId: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  /** Exclude this event (updates). */
  excludeEventId?: string;
  candidates: readonly SpaceConflictCandidate[];
};

export function findSpaceConflicts(
  input: SpaceConflictCheckInput,
): SpaceConflictHit[] {
  const date = input.eventDate.trim();
  if (!date || !input.spaceId.trim()) return [];

  return input.candidates
    .filter((candidate) => {
      if (candidate.status === 'cancelled') return false;
      if (candidate.eventDate !== date) return false;
      if (input.excludeEventId && candidate.id === input.excludeEventId) {
        return false;
      }
      return intervalsOverlap(
        { startTime: input.startTime, endTime: input.endTime },
        { startTime: candidate.startTime, endTime: candidate.endTime },
      );
    })
    .map((candidate) => ({
      id: candidate.id,
      title: formatChurchEventDisplayTitle(candidate),
      eventDate: candidate.eventDate,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      status: candidate.status,
    }));
}

export function formatSpaceConflictMessage(
  conflicts: readonly SpaceConflictHit[],
  spaceLabel: string,
): string {
  if (conflicts.length === 0) return '';
  const first = conflicts[0];
  const when = [first?.startTime, first?.endTime].filter(Boolean).join('–') || 'all day';
  const more =
    conflicts.length > 1 ? ` (+${conflicts.length - 1} more)` : '';
  return `${spaceLabel} is already booked for “${first?.title ?? 'another event'}” (${when})${more}. Pick another room or time.`;
}
