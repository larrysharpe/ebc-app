import type { ChoirGroup, PlanSongSlotType, PlanStatus, ServiceMusicPlan } from '../types';
import { SLOT_TYPE_LABELS } from '../types';
import { getChoirName } from './choir.utils';
import { formatServiceDate } from './music.format';

export type SongPerformance = {
  planId: string;
  planTitle: string;
  serviceDate: string;
  choirGroup: ChoirGroup;
  assignments: string;
  slotType: PlanSongSlotType;
  status: PlanStatus;
  directorName: string;
};

export function getSongPerformances(
  songId: string,
  plans: ServiceMusicPlan[],
): SongPerformance[] {
  const performances: SongPerformance[] = [];

  for (const plan of plans) {
    for (const slot of plan.songs) {
      if (slot.songId !== songId) continue;

      performances.push({
        planId: plan.id,
        planTitle: plan.title,
        serviceDate: plan.serviceDate,
        choirGroup: plan.choirGroup,
        assignments: slot.assignments,
        slotType: slot.slotType,
        status: plan.status,
        directorName: plan.directorName,
      });
    }
  }

  return performances.sort(
    (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime(),
  );
}

/** Most recent sent service; falls back to latest draft if never sent. */
export function getLastSungPerformance(
  performances: SongPerformance[],
): SongPerformance | undefined {
  const sent = performances.filter((p) => p.status === 'sent');
  return sent[0] ?? performances[0];
}

export function formatPerformanceSummary(performance: SongPerformance): string {
  const date = formatServiceDate(performance.serviceDate);
  const choir = getChoirName(performance.choirGroup);
  const slot = SLOT_TYPE_LABELS[performance.slotType].toLowerCase();
  return `${date} · ${choir} · ${slot}`;
}
