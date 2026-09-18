import type { ChoirGroup, PlanSongSlotType } from './music.types';
import { STANDARD_SERVICE_SLOT_TYPES } from './music.types';

/** 0 = Sunday … 6 = Saturday (matches Date#getDay). */
export type PracticeWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Relative rehearsal default for new choir plans.
 * Example: Saturday, weeksBefore 1 = Saturday before they sing;
 * Saturday, weeksBefore 2 = two Saturdays before.
 */
export type DefaultPracticeTemplate = {
  id: string;
  weekday: PracticeWeekday;
  /** 1–8: which matching weekday before the service date. */
  weeksBefore: number;
  startTime: string;
  endTime: string;
  location?: string;
};

export type ChoirDirectorSettings = {
  defaultChoirGroup: ChoirGroup;
  serviceStartTime: string;
  serviceEndTime: string;
  /** @deprecated Prefer defaultPractices[0]; kept for older rows / forms. */
  practiceWeekday: PracticeWeekday;
  /** @deprecated Prefer defaultPractices[0]. */
  practiceStartTime: string;
  /** @deprecated Prefer defaultPractices[0]. */
  practiceEndTime: string;
  defaultPractices: DefaultPracticeTemplate[];
  /** Ordered slot types used by “Add default service slots” on a plan. */
  defaultServiceSlots: PlanSongSlotType[];
};

export const PRACTICE_WEEKDAY_LABELS: Record<PracticeWeekday, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export const DEFAULT_PRACTICE_TEMPLATE: DefaultPracticeTemplate = {
  id: 'practice-default-1',
  weekday: 6,
  weeksBefore: 1,
  startTime: '09:00',
  endTime: '11:00',
};

export const DEFAULT_CHOIR_DIRECTOR_SETTINGS: ChoirDirectorSettings = {
  defaultChoirGroup: 'senior',
  serviceStartTime: '11:00',
  serviceEndTime: '13:00',
  practiceWeekday: 6,
  practiceStartTime: '09:00',
  practiceEndTime: '11:00',
  defaultPractices: [{ ...DEFAULT_PRACTICE_TEMPLATE }],
  defaultServiceSlots: [...STANDARD_SERVICE_SLOT_TYPES],
};
