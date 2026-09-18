import type { Ministry } from '../types';
import { dutyIdsInUse } from './ministry-personnel.utils';
import { formatEventDate, sortEventsUpcoming } from './ministry.utils';

export const MINISTRY_PLAN_WINDOW_DAYS = 28;

export type MinistryPlanSignalTone = 'urgent' | 'normal';

export type MinistryPlanSignal = {
  id: string;
  label: string;
  detail: string;
  href: string;
  tone: MinistryPlanSignalTone;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isWithinWindow(iso: string, now: Date, windowDays: number): boolean {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return false;
  const start = startOfDay(now).getTime();
  const end = addDays(startOfDay(now), windowDays).getTime();
  const time = target.getTime();
  return time >= start && time <= end;
}

/**
 * Deterministic “needs attention” items for the next 4 weeks.
 * Safe for UI and AI context (no emails/phones).
 */
export function buildMinistryPlanSignals(
  ministry: Ministry,
  now: Date = new Date(),
): MinistryPlanSignal[] {
  const signals: MinistryPlanSignal[] = [];
  const base = `/ministries/${ministry.slug}`;

  const upcoming = sortEventsUpcoming(ministry.events).filter((event) =>
    isWithinWindow(event.startAt, now, MINISTRY_PLAN_WINDOW_DAYS),
  );

  for (const event of upcoming.slice(0, 8)) {
    signals.push({
      id: `event-${event.id}`,
      label: `Prepare: ${event.title}`,
      detail: `${formatEventDate(event.startAt)}${event.location ? ` · ${event.location}` : ''}`,
      href: `${base}?tab=calendar`,
      tone: 'urgent',
    });
  }

  const openRoles = ministry.personnel.filter((person) => person.isOpenRole);
  for (const role of openRoles.slice(0, 5)) {
    signals.push({
      id: `open-${role.id}`,
      label: `Fill open role: ${role.name}`,
      detail: 'Vacancy on the roster',
      href: `${base}?tab=personnel`,
      tone: 'urgent',
    });
  }

  const shortDuties = ministry.dutyCatalog.filter((duty) => {
    if (!duty.active) return false;
    return dutyIdsInUse(ministry.personnel, duty.id) < duty.neededCount;
  });
  for (const duty of shortDuties.slice(0, 5)) {
    const assigned = dutyIdsInUse(ministry.personnel, duty.id);
    signals.push({
      id: `duty-${duty.id}`,
      label: `Assign duty: ${duty.label}`,
      detail:
        assigned === 0
          ? `Need ${duty.neededCount}; none assigned yet`
          : `Need ${duty.neededCount}; ${assigned} assigned`,
      href: `${base}?tab=personnel`,
      tone: 'normal',
    });
  }

  for (const sop of ministry.sops) {
    if (sop.status === 'draft' || sop.status === 'in_review') {
      signals.push({
        id: `sop-status-${sop.id}`,
        label: `Advance SOP: ${sop.title}`,
        detail: `Status: ${sop.status === 'draft' ? 'draft' : 'in review'}`,
        href: `${base}?tab=sops`,
        tone: 'normal',
      });
    }
    if (sop.nextReviewAt && isWithinWindow(sop.nextReviewAt, now, MINISTRY_PLAN_WINDOW_DAYS)) {
      signals.push({
        id: `sop-review-${sop.id}`,
        label: `Review due: ${sop.title}`,
        detail: `Next review ${sop.nextReviewAt.slice(0, 10)}`,
        href: `${base}?tab=sops`,
        tone: 'urgent',
      });
    }
  }

  if (ministry.meetingSummary && upcoming.length === 0 && ministry.events.length === 0) {
    signals.push({
      id: 'calendar-empty',
      label: 'Add upcoming calendar items',
      detail: `Meeting rhythm on file (“${ministry.meetingSummary}”) but no events scheduled`,
      href: `${base}?tab=calendar`,
      tone: 'normal',
    });
  }

  if (ministry.personnel.length === 0) {
    signals.push({
      id: 'roster-empty',
      label: 'Build the roster',
      detail: 'No people assigned to this ministry yet',
      href: `${base}?tab=personnel`,
      tone: 'urgent',
    });
  }

  return signals;
}

export type MinistryPlanPromptContext = {
  ministry: Ministry;
  signals: MinistryPlanSignal[];
  now?: Date;
};

/** Build a Cursor ask-only prompt (no PII: emails/phones omitted). */
export function buildMinistryPlanPrompt(context: MinistryPlanPromptContext): string {
  const now = context.now ?? new Date();
  const { ministry, signals } = context;
  const windowEnd = addDays(startOfDay(now), MINISTRY_PLAN_WINDOW_DAYS);

  const upcoming = sortEventsUpcoming(ministry.events).filter((event) =>
    isWithinWindow(event.startAt, now, MINISTRY_PLAN_WINDOW_DAYS),
  );

  const dutyLines = ministry.dutyCatalog
    .filter((duty) => duty.active)
    .map((duty) => {
      const assigned = dutyIdsInUse(ministry.personnel, duty.id);
      return `- ${duty.label}: ${assigned} of ${duty.neededCount} needed${duty.sopId ? ' (has linked SOP)' : ' (no SOP linked)'}`;
    });

  const rosterLines = ministry.personnel.map((person) => {
    const duties =
      person.duties?.length && ministry.dutyCatalog.length
        ? person.duties
            .map((id) => ministry.dutyCatalog.find((duty) => duty.id === id)?.label ?? id)
            .join(', ')
        : 'no duties';
    const open = person.isOpenRole ? ' [open role]' : '';
    return `- ${person.name}${open} · ${person.role} · ${duties}`;
  });

  const sopLines = ministry.sops.map((sop) => {
    const status = sop.status ?? 'unknown';
    const review = sop.nextReviewAt ? ` · review ${sop.nextReviewAt.slice(0, 10)}` : '';
    return `- ${sop.title} (${status}${review})`;
  });

  const signalLines =
    signals.length > 0
      ? signals.map((signal) => `- ${signal.label}: ${signal.detail}`)
      : ['- (none flagged by the app)'];

  const eventLines =
    upcoming.length > 0
      ? upcoming.map(
          (event) =>
            `- ${event.title} · ${formatEventDate(event.startAt)}${event.location ? ` · ${event.location}` : ''}${event.recurring ? ` · ${event.recurring}` : ''}`,
        )
      : ['- (no events in the next 28 days)'];

  return [
    `Ministry: ${ministry.name} (${ministry.category})`,
    `Planning window: ${startOfDay(now).toISOString().slice(0, 10)} through ${windowEnd.toISOString().slice(0, 10)} (next 4 weeks)`,
    ministry.meetingSummary ? `Meeting rhythm: ${ministry.meetingSummary}` : 'Meeting rhythm: (not set)',
    '',
    'App-detected needs:',
    ...signalLines,
    '',
    'Upcoming events:',
    ...eventLines,
    '',
    `Roster (${ministry.personnel.length}):`,
    ...(rosterLines.length > 0 ? rosterLines : ['- (empty)']),
    '',
    'Active duties:',
    ...(dutyLines.length > 0 ? dutyLines : ['- (none defined)']),
    '',
    'SOPs:',
    ...(sopLines.length > 0 ? sopLines : ['- (none)']),
    '',
    'Produce a practical plan for the next 4 weeks for this ministry leader.',
    'Structure the reply as Week 1, Week 2, Week 3, Week 4.',
    'Under each week, give 2–4 concrete action bullets.',
    'When useful, name which EBC APP tab to use (Roster, Duties, Calendar, SOPs, Media, Documents).',
    'Do not invent people, emails, phone numbers, or giving data.',
    'Do not modify application code — plain text only.',
  ].join('\n');
}
