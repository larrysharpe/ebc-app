export const NEW_PLAN_STEPS = [
  { id: 'event', label: 'Event', shortLabel: 'Event' },
  { id: 'choir', label: 'Choir & title', shortLabel: 'Choir' },
  { id: 'practice', label: 'Practice', shortLabel: 'Practice' },
  { id: 'details', label: 'Details', shortLabel: 'Details' },
  { id: 'setlist', label: 'Set list', shortLabel: 'Songs' },
  { id: 'preview', label: 'Preview & finish', shortLabel: 'Finish' },
] as const;

export type NewPlanStepId = (typeof NEW_PLAN_STEPS)[number]['id'];

export const NEW_PLAN_STEP_COUNT = NEW_PLAN_STEPS.length;
