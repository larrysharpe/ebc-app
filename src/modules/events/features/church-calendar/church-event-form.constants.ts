export const EVENT_FORM_STEPS = [
  { id: 'basics', label: 'Basics' },
  { id: 'when', label: 'When' },
  { id: 'where', label: 'Where' },
  { id: 'people', label: 'People' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'media', label: 'Media' },
  { id: 'floorPlan', label: 'Floor plan' },
  { id: 'coordination', label: 'Coordination' },
  { id: 'review', label: 'Review' },
] as const;

export type EventFormStepId = (typeof EVENT_FORM_STEPS)[number]['id'];

export function eventFormStepIndex(step: EventFormStepId): number {
  return EVENT_FORM_STEPS.findIndex((item) => item.id === step);
}
