import {
  LEAD_TIME_EMERGENCY_DAYS,
  LEAD_TIME_FLEXIBLE_DAYS,
  LEAD_TIME_MESSAGES,
  LEAD_TIME_PLENTY_DAYS,
  type LeadTimeTier,
} from '../constants/activity-request.constants';

function toDateOnlyUtc(isoDate: string): Date {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

function todayDateOnlyUtc(now: Date): Date {
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
}

/** Whole days from today until event date (negative if past). */
export function daysUntilEventDate(
  eventDate: string,
  now: Date = new Date(),
): number {
  const event = toDateOnlyUtc(eventDate);
  const today = todayDateOnlyUtc(now);
  const ms = event.getTime() - today.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function getLeadTimeTier(daysUntil: number): LeadTimeTier {
  if (daysUntil >= LEAD_TIME_PLENTY_DAYS) return 'plenty';
  if (daysUntil >= LEAD_TIME_FLEXIBLE_DAYS) return 'ok';
  if (daysUntil >= LEAD_TIME_EMERGENCY_DAYS) return 'short';
  return 'emergency';
}

export function getLeadTimeTierForDate(
  eventDate: string | undefined,
  now: Date = new Date(),
): LeadTimeTier | null {
  if (!eventDate?.trim()) return null;
  return getLeadTimeTier(daysUntilEventDate(eventDate, now));
}

export function getLeadTimeBanner(
  eventDate: string | undefined,
  now: Date = new Date(),
): {
  tier: LeadTimeTier;
  tone: 'info' | 'ok' | 'amber' | 'red';
  message: string;
  daysUntil: number;
} | null {
  if (!eventDate?.trim()) return null;
  const daysUntil = daysUntilEventDate(eventDate, now);
  const tier = getLeadTimeTier(daysUntil);
  const { tone, message } = LEAD_TIME_MESSAGES[tier];
  return { tier, tone, message, daysUntil };
}

/** Ministry leaders cannot skip approval for emergency lead time. */
export function requiresEmergencyApproval(
  eventDate: string | undefined,
  now: Date = new Date(),
): boolean {
  const tier = getLeadTimeTierForDate(eventDate, now);
  return tier === 'emergency';
}
