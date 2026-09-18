import { getChoirName } from './choir.utils';
import type { ServiceMusicPlan } from '../types';
import {
  getDefaultChoirForDate,
  getSundayOfMonth,
} from './choir-schedule.utils';
import {
  formatRepertoireStatLine,
  type RepertoireSnapshot,
} from './repertoire.utils';

export type RepertoireCoachPromptContext = {
  snapshot: RepertoireSnapshot;
  upcomingPlans: ServiceMusicPlan[];
  draftCount: number;
  now?: Date;
};

function nextSundays(count: number, now: Date): string[] {
  const dates: string[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (dates.length < count) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() === 0) {
      dates.push(cursor.toISOString().slice(0, 10));
    }
  }
  return dates;
}

/** Build a Cursor ask-only prompt (song titles only — no member PII). */
export function buildRepertoireCoachPrompt(
  context: RepertoireCoachPromptContext,
): string {
  const now = context.now ?? new Date();
  const { snapshot, upcomingPlans, draftCount } = context;

  const trendingLines =
    snapshot.trending.length > 0
      ? snapshot.trending.map((s) => `- ${formatRepertoireStatLine(s)}`)
      : ['- (none in the last 90 days)'];

  const restingLines =
    snapshot.resting.length > 0
      ? snapshot.resting.map((s) => `- ${formatRepertoireStatLine(s)}`)
      : ['- (none resting 60+ days)'];

  const neverLines =
    snapshot.neverSung.length > 0
      ? snapshot.neverSung.map((s) => `- ${formatRepertoireStatLine(s)}`)
      : ['- (catalog songs all appear on at least one sent plan)'];

  const upcomingLines =
    upcomingPlans.length > 0
      ? upcomingPlans.map((plan) => {
          const titles = plan.songs
            .map((slot) => slot.customTitle ?? slot.songId ?? 'TBD')
            .slice(0, 6)
            .join('; ');
          return `- ${plan.serviceDate} · ${getChoirName(plan.choirGroup)} · ${plan.status} · ${plan.title} · slots: ${titles || 'empty'}`;
        })
      : ['- (no upcoming draft/sent plans on file)'];

  const rotationLines = nextSundays(4, now).map((iso) => {
    const sunday = getSundayOfMonth(iso);
    const choir = getDefaultChoirForDate(iso);
    const label = choir ? getChoirName(choir) : '—';
    return `- ${iso} · ${sunday ?? '?'} Sunday · default ${label}`;
  });

  return [
    'You are coaching an Ebenezer Baptist Church choir director on repertoire.',
    `As of: ${snapshot.asOf}`,
    `Open drafts: ${draftCount}`,
    '',
    'Chapel choir rotation (next 4 Sundays, default schedule):',
    ...rotationLines,
    '',
    'Trending in recent services (sent plans, last ~90 days):',
    ...trendingLines,
    '',
    'Resting / ready to revisit (sung before, 60+ days quiet):',
    ...restingLines,
    '',
    'In catalog but never on a sent plan:',
    ...neverLines,
    '',
    `Recent theme mix: ${snapshot.recentThemes.join(', ') || '(none)'}`,
    '',
    'Upcoming plans on file:',
    ...upcomingLines,
    '',
    'Produce practical repertoire guidance for a choir director.',
    'Use markdown with these exact headings:',
    '## What\'s trending',
    '## Bring back / rest',
    '## Rehearsal focus (next 2–3 practices)',
    '## Fresh picks to develop',
    'Under each heading give 2–4 concrete bullets.',
    'Prefer songs named in the lists above. Do not invent titles not listed.',
    'Do not invent member names, emails, phone numbers, or giving data.',
    'Do not modify application code — plain text only.',
    'Keep tone warm, practical, and church-appropriate.',
  ].join('\n');
}
