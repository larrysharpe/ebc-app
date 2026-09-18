import type { PlanPractice, ServiceMusicPlan } from '../types';

export function createEmptyPractice(
  seed?: Partial<PlanPractice>,
): PlanPractice {
  return {
    id: seed?.id ?? `practice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: seed?.date ?? '',
    startTime: seed?.startTime ?? '',
    endTime: seed?.endTime ?? '',
    location: seed?.location ?? '',
  };
}

/** Prefer `practices[]`; fall back to legacy single practice fields. */
export function getPlanPractices(plan: Pick<
  ServiceMusicPlan,
  'practices' | 'practiceDate' | 'practiceStartTime' | 'practiceEndTime' | 'practiceLocation'
>): PlanPractice[] {
  if (plan.practices && plan.practices.length > 0) {
    return plan.practices.map((practice) => ({
      id: practice.id,
      date: practice.date ?? '',
      startTime: practice.startTime ?? '',
      endTime: practice.endTime ?? '',
      location: practice.location ?? '',
    }));
  }

  if (
    !plan.practiceDate &&
    !plan.practiceStartTime &&
    !plan.practiceEndTime &&
    !plan.practiceLocation
  ) {
    return [];
  }

  return [
    createEmptyPractice({
      id: 'practice-legacy',
      date: plan.practiceDate ?? '',
      startTime: plan.practiceStartTime ?? '',
      endTime: plan.practiceEndTime ?? '',
      location: plan.practiceLocation ?? '',
    }),
  ];
}

/** Keep JSON + legacy columns aligned (first practice mirrors legacy fields). */
export function withSyncedPractices(
  plan: ServiceMusicPlan,
  practices: PlanPractice[],
): ServiceMusicPlan {
  const cleaned = practices
    .map((practice) => ({
      id: practice.id || createEmptyPractice().id,
      date: practice.date.trim(),
      startTime: practice.startTime?.trim() || undefined,
      endTime: practice.endTime?.trim() || undefined,
      location: practice.location?.trim() || undefined,
    }))
    .filter(
      (practice) =>
        practice.date ||
        practice.startTime ||
        practice.endTime ||
        practice.location,
    );

  const first = cleaned[0];

  return {
    ...plan,
    practices: cleaned,
    practiceDate: first?.date || undefined,
    practiceStartTime: first?.startTime,
    practiceEndTime: first?.endTime,
    practiceLocation: first?.location,
  };
}

export function parsePracticesJson(value: unknown): PlanPractice[] {
  if (!Array.isArray(value)) return [];
  const practices: PlanPractice[] = [];
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const date = typeof row.date === 'string' ? row.date : '';
    const startTime = typeof row.startTime === 'string' ? row.startTime : '';
    const endTime = typeof row.endTime === 'string' ? row.endTime : '';
    const location = typeof row.location === 'string' ? row.location : '';
    const id =
      typeof row.id === 'string' && row.id ? row.id : `practice-${index + 1}`;
    if (!date && !startTime && !endTime && !location) continue;
    practices.push({ id, date, startTime, endTime, location });
  }
  return practices;
}
