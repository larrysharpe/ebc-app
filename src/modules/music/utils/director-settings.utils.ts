import type { ChoirGroup, PlanPractice, PlanSongSlotType } from '../types';
import { STANDARD_SERVICE_SLOT_TYPES } from '../types';
import type {
  ChoirDirectorSettings,
  DefaultPracticeTemplate,
  PracticeWeekday,
} from '../types/director-settings.types';
import {
  DEFAULT_PRACTICE_TEMPLATE,
  PRACTICE_WEEKDAY_LABELS,
} from '../types/director-settings.types';
import { getDefaultChoirForDate } from './choir-schedule.utils';
import { createEmptyPractice } from './plan-practice.utils';

/** Ensure at least one slot; fall back to the chapel template when empty. */
export function normalizeDefaultServiceSlots(
  slots: readonly PlanSongSlotType[],
): PlanSongSlotType[] {
  if (slots.length === 0) return [...STANDARD_SERVICE_SLOT_TYPES];
  return [...slots];
}

export function createEmptyPracticeTemplate(
  seed?: Partial<DefaultPracticeTemplate>,
): DefaultPracticeTemplate {
  return {
    id:
      seed?.id ??
      `practice-template-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    weekday: seed?.weekday ?? 6,
    weeksBefore: seed?.weeksBefore ?? 1,
    startTime: seed?.startTime ?? '09:00',
    endTime: seed?.endTime ?? '11:00',
    location: seed?.location,
  };
}

/**
 * Normalize relative practice templates. Empty → one Saturday-before default
 * (or a single row synthesized from legacy weekday/time fields).
 */
export function normalizeDefaultPractices(
  practices: readonly DefaultPracticeTemplate[] | null | undefined,
  legacy?: {
    practiceWeekday: PracticeWeekday;
    practiceStartTime: string;
    practiceEndTime: string;
  },
): DefaultPracticeTemplate[] {
  const cleaned: DefaultPracticeTemplate[] = [];
  for (const [index, item] of (practices ?? []).entries()) {
    if (!item || typeof item !== 'object') continue;
    const weekday = Number(item.weekday);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) continue;
    const weeksBeforeRaw = Number(item.weeksBefore ?? 1);
    const weeksBefore = Number.isFinite(weeksBeforeRaw)
      ? Math.max(1, Math.min(8, Math.floor(weeksBeforeRaw)))
      : 1;
    const startTime =
      typeof item.startTime === 'string' && /^\d{2}:\d{2}$/.test(item.startTime)
        ? item.startTime
        : '09:00';
    const endTime =
      typeof item.endTime === 'string' && /^\d{2}:\d{2}$/.test(item.endTime)
        ? item.endTime
        : '11:00';
    const id =
      typeof item.id === 'string' && item.id
        ? item.id
        : `practice-template-${index + 1}`;
    const next: DefaultPracticeTemplate = {
      id,
      weekday: weekday as PracticeWeekday,
      weeksBefore,
      startTime,
      endTime,
    };
    if (typeof item.location === 'string' && item.location.trim()) {
      next.location = item.location.trim();
    }
    cleaned.push(next);
  }

  if (cleaned.length > 0) return cleaned;

  if (legacy) {
    return [
      createEmptyPracticeTemplate({
        id: 'practice-legacy',
        weekday: legacy.practiceWeekday,
        weeksBefore: 1,
        startTime: legacy.practiceStartTime,
        endTime: legacy.practiceEndTime,
      }),
    ];
  }

  return [{ ...DEFAULT_PRACTICE_TEMPLATE }];
}

/** Human label, e.g. "Saturday before they sing" / "2 Saturdays before they sing". */
export function formatPracticeRelativeLabel(
  weekday: PracticeWeekday,
  weeksBefore: number,
): string {
  const day = PRACTICE_WEEKDAY_LABELS[weekday];
  const weeks = Math.max(1, Math.min(8, Math.floor(weeksBefore)));
  if (weeks <= 1) return `${day} before they sing`;
  return `${weeks} ${day}s before they sing`;
}

/**
 * Nth matching weekday strictly before the service date.
 * weeksBefore=1 → Saturday before a Sunday; weeksBefore=2 → two Saturdays before.
 */
export function getPracticeDateForService(
  serviceDateIso: string,
  practiceWeekday: PracticeWeekday,
  weeksBefore = 1,
): string {
  const weeks = Math.max(1, Math.min(8, Math.floor(weeksBefore)));
  const service = new Date(`${serviceDateIso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(service.getTime())) return serviceDateIso.slice(0, 10);

  let firstMatch: Date | null = null;
  for (let daysBack = 1; daysBack <= 7; daysBack += 1) {
    const candidate = new Date(service);
    candidate.setDate(service.getDate() - daysBack);
    if (candidate.getDay() === practiceWeekday) {
      firstMatch = candidate;
      break;
    }
  }

  if (!firstMatch) return serviceDateIso.slice(0, 10);

  firstMatch.setDate(firstMatch.getDate() - (weeks - 1) * 7);
  return firstMatch.toISOString().slice(0, 10);
}

export function buildPracticesFromSettings(
  serviceDateIso: string,
  settings: ChoirDirectorSettings,
): PlanPractice[] {
  const templates = normalizeDefaultPractices(settings.defaultPractices, {
    practiceWeekday: settings.practiceWeekday,
    practiceStartTime: settings.practiceStartTime,
    practiceEndTime: settings.practiceEndTime,
  });

  return templates
    .map((template, index) =>
      createEmptyPractice({
        id: `practice-${index + 1}`,
        date: getPracticeDateForService(
          serviceDateIso,
          template.weekday,
          template.weeksBefore,
        ),
        startTime: template.startTime,
        endTime: template.endTime,
        location: template.location ?? '',
      }),
    )
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return (a.startTime ?? '').localeCompare(b.startTime ?? '');
    });
}

/**
 * Choir for a new plan: chapel rotation for that Sunday when known,
 * otherwise the director's preferred default choir.
 */
export function resolveDefaultChoirForPlan(
  serviceDateIso: string | undefined,
  settings: ChoirDirectorSettings,
): ChoirGroup {
  if (serviceDateIso) {
    const fromRotation = getDefaultChoirForDate(serviceDateIso);
    if (fromRotation) return fromRotation;
  }
  return settings.defaultChoirGroup;
}

export function buildPlanDefaultsFromSettings(
  serviceDateIso: string,
  settings: ChoirDirectorSettings,
): {
  choirGroup: ChoirGroup;
  serviceStartTime: string;
  serviceEndTime: string;
  practiceDate: string;
  practiceStartTime: string;
  practiceEndTime: string;
  practices: PlanPractice[];
} {
  const practices = buildPracticesFromSettings(serviceDateIso, settings);
  const first = practices[0];

  return {
    choirGroup: resolveDefaultChoirForPlan(serviceDateIso, settings),
    serviceStartTime: settings.serviceStartTime,
    serviceEndTime: settings.serviceEndTime,
    practiceDate: first?.date ?? getPracticeDateForService(serviceDateIso, settings.practiceWeekday),
    practiceStartTime: first?.startTime ?? settings.practiceStartTime,
    practiceEndTime: first?.endTime ?? settings.practiceEndTime,
    practices,
  };
}

export function getDefaultServiceSlotsFromSettings(
  settings: ChoirDirectorSettings,
): PlanSongSlotType[] {
  return normalizeDefaultServiceSlots(settings.defaultServiceSlots);
}

/** Keep legacy single-practice columns aligned with the first template. */
export function withSyncedLegacyPracticeFields(
  settings: Omit<
    ChoirDirectorSettings,
    'practiceWeekday' | 'practiceStartTime' | 'practiceEndTime'
  > &
    Partial<
      Pick<
        ChoirDirectorSettings,
        'practiceWeekday' | 'practiceStartTime' | 'practiceEndTime'
      >
    >,
): ChoirDirectorSettings {
  const defaultPractices = normalizeDefaultPractices(settings.defaultPractices);
  const first = defaultPractices[0] ?? DEFAULT_PRACTICE_TEMPLATE;
  return {
    ...settings,
    defaultPractices,
    practiceWeekday: first.weekday,
    practiceStartTime: first.startTime,
    practiceEndTime: first.endTime,
    defaultServiceSlots: normalizeDefaultServiceSlots(settings.defaultServiceSlots),
  };
}
