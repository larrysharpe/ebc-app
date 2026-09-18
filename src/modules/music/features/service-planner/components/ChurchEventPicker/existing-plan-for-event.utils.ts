import type { ChurchEvent } from '@/modules/events/types/church-event.types';
import type { ServiceMusicPlan } from '@/modules/music/types';

export type ExistingPlanForEvent = {
  planId: string;
  title: string;
  status: ServiceMusicPlan['status'];
};

export type PlanForEventMatch = Pick<
  ServiceMusicPlan,
  'id' | 'title' | 'status' | 'churchEventId' | 'serviceDate'
>;

function toExisting(plan: PlanForEventMatch): ExistingPlanForEvent {
  return {
    planId: plan.id,
    title: plan.title,
    status: plan.status,
  };
}

/**
 * Map church event id → existing choir plan.
 * Prefers `churchEventId` match; falls back to same service date only for
 * plans that are not already linked to a different event.
 */
export function buildExistingPlansByEventId(
  events: readonly ChurchEvent[],
  plans: readonly PlanForEventMatch[],
): Record<string, ExistingPlanForEvent> {
  const result: Record<string, ExistingPlanForEvent> = {};

  for (const event of events) {
    const linked = plans.find((plan) => plan.churchEventId === event.id);
    if (linked) {
      result[event.id] = toExisting(linked);
    }
  }

  for (const event of events) {
    if (result[event.id] || !event.eventDate) continue;
    const date = event.eventDate.slice(0, 10);
    const unlinkedOnDate = plans.find(
      (plan) =>
        plan.serviceDate.slice(0, 10) === date &&
        !plan.churchEventId &&
        !Object.values(result).some((row) => row.planId === plan.id),
    );
    if (unlinkedOnDate) {
      result[event.id] = toExisting(unlinkedOnDate);
    }
  }

  return result;
}

export function isEventToday(
  eventDate: string,
  todayIso: string = new Date().toISOString().slice(0, 10),
): boolean {
  return eventDate.slice(0, 10) === todayIso.slice(0, 10);
}

export function existingPlanStatusLabel(
  status: ServiceMusicPlan['status'],
): string {
  return status === 'sent' ? 'Shared with choir' : 'Still drafting';
}
