import type { ChurchEventType } from '../types/church-event.types';

export const LEAD_TIME_TIERS = [
  'plenty',
  'ok',
  'short',
  'emergency',
] as const;

export type LeadTimeTier = (typeof LEAD_TIME_TIERS)[number];

/** Soft tip: plan ads and logistics early. */
export const LEAD_TIME_PLENTY_DAYS = 90;
/** Flexible expectation for normal requests. */
export const LEAD_TIME_FLEXIBLE_DAYS = 28;
/** Shorter than this = emergency / contact office. */
export const LEAD_TIME_EMERGENCY_DAYS = 3;

export const ACTIVITY_HELP_FROM = [
  'ushers',
  'trustees',
  'communications',
  'other_ministries',
] as const;

export type ActivityHelpFrom = (typeof ACTIVITY_HELP_FROM)[number];

export const ACTIVITY_HELP_FROM_LABELS: Record<ActivityHelpFrom, string> = {
  ushers: 'Ushers',
  trustees: 'Trustees',
  communications: 'Communications',
  other_ministries: 'Other ministries',
};

export const ACTIVITY_MEDIA_FIELDS = [
  'sound',
  'slides',
  'livestream',
  'camera',
  'graphics',
  'playback',
] as const;

export type ActivityMediaField = (typeof ACTIVITY_MEDIA_FIELDS)[number];

export const ACTIVITY_MEDIA_FIELD_LABELS: Record<ActivityMediaField, string> = {
  sound: 'Sound / microphones',
  slides: 'Slides / projection',
  livestream: 'Livestream',
  camera: 'Camera / recording',
  graphics: 'Graphics / overlays',
  playback: 'Music or video played',
};

/** Kitchen / food checklist (no quantities in v1 — notes cover specialty items). */
export const ACTIVITY_KITCHEN_FIELDS = [
  'heatingCooking',
  'utensils',
  'plates',
  'cupsGlasses',
  'napkinsTableCloths',
  'coffee',
  'refrigeration',
  'freezer',
] as const;

export type ActivityKitchenField = (typeof ACTIVITY_KITCHEN_FIELDS)[number];

export const ACTIVITY_KITCHEN_FIELD_LABELS: Record<
  ActivityKitchenField,
  string
> = {
  heatingCooking: 'Kitchen for heating / cooking',
  utensils: 'Utensils (knives, forks, spoons, etc.)',
  plates: 'Plates / bowls',
  cupsGlasses: 'Cups / glasses',
  napkinsTableCloths: 'Napkins / tablecloths',
  coffee: 'Coffee pot / coffee cups',
  refrigeration: 'Refrigerator use',
  freezer: 'Freezer use',
};

/** Room setup / floor-plan feature requests with quantities (0 = not requested). */
export const ACTIVITY_FLOOR_PLAN_FIELDS = [
  'theaterSeating',
  'roundTables',
  'classroomSeating',
  'podium',
  'registrationTable',
  'servingTables',
  'clearFloor',
  'accessibilitySeating',
] as const;

export type ActivityFloorPlanField =
  (typeof ACTIVITY_FLOOR_PLAN_FIELDS)[number];

export const ACTIVITY_FLOOR_PLAN_FIELD_LABELS: Record<
  ActivityFloorPlanField,
  string
> = {
  theaterSeating: 'Theater / facing-front seating',
  roundTables: 'Round tables',
  classroomSeating: 'Classroom / rows seating',
  podium: 'Podium / lectern',
  registrationTable: 'Welcome / registration table',
  servingTables: 'Food serving tables',
  clearFloor: 'Open floor (clear furniture)',
  accessibilitySeating: 'Accessibility seating',
};

/** Unit label for quantity UI; null = yes/no only (quantity 0 or 1). */
export const ACTIVITY_FLOOR_PLAN_FIELD_UNITS: Record<
  ActivityFloorPlanField,
  string | null
> = {
  theaterSeating: 'chairs',
  roundTables: 'tables',
  classroomSeating: 'chairs',
  podium: 'stands',
  registrationTable: 'tables',
  servingTables: 'tables',
  clearFloor: null,
  accessibilitySeating: 'seats',
};

export const ACTIVITY_FLOOR_PLAN_QTY_MAX = 500;

/** How the Media wizard step behaves for each event type. */
export type ActivityMediaStepMode = 'confirm' | 'optional' | 'ask';

export const ACTIVITY_MEDIA_STEP_MODE: Record<
  ChurchEventType,
  ActivityMediaStepMode
> = {
  worship: 'confirm',
  special: 'confirm',
  education: 'optional',
  meeting: 'optional',
  outreach: 'ask',
  other: 'ask',
};

export const LEAD_TIME_MESSAGES: Record<
  LeadTimeTier,
  { tone: 'info' | 'ok' | 'amber' | 'red'; message: string }
> = {
  plenty: {
    tone: 'info',
    message: 'Plenty of time for planning and ads.',
  },
  ok: {
    tone: 'ok',
    message:
      'Timing looks fine. Ninety days ahead is ideal when you need ads or setup.',
  },
  short: {
    tone: 'amber',
    message:
      'Under 4 weeks — flexible, but contact the office if you need ads, funds, or setup.',
  },
  emergency: {
    tone: 'red',
    message:
      'Less than 3 days — emergency only. Contact the office, and share a short reason below.',
  },
};
