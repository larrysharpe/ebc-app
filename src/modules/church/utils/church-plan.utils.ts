import type { Ministry, MinistryPlanSignal } from '@/modules/ministries';

import { CHURCH_PLAN_EXCERPT_MAX_CHARS } from '../constants/church-plan.constants';
import type { MinistryPlanRollupEntry } from '../types/church-plan.types';

export function excerptSuggestedPlan(
  plan: string | undefined,
  maxChars: number = CHURCH_PLAN_EXCERPT_MAX_CHARS,
): string | null {
  if (!plan?.trim()) return null;
  const trimmed = plan.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars - 1).trimEnd()}…`;
}

export function buildMinistryPlanRollupEntry(
  ministry: Ministry,
  signals: MinistryPlanSignal[],
): MinistryPlanRollupEntry {
  return {
    slug: ministry.slug,
    name: ministry.name,
    category: ministry.category,
    urgentSignals: signals
      .filter((signal) => signal.tone === 'urgent')
      .map((signal) => `${signal.label}: ${signal.detail}`),
    normalSignals: signals
      .filter((signal) => signal.tone === 'normal')
      .map((signal) => `${signal.label}: ${signal.detail}`),
    planExcerpt: excerptSuggestedPlan(ministry.suggestedPlan),
    planGeneratedAt: ministry.suggestedPlanGeneratedAt,
  };
}

export function buildChurchPlanPrompt(rollup: MinistryPlanRollupEntry[]): string {
  const urgentLines = rollup.flatMap((entry) =>
    entry.urgentSignals.map((line) => `- [${entry.name}] ${line}`),
  );
  const normalLines = rollup.flatMap((entry) =>
    entry.normalSignals.map((line) => `- [${entry.name}] ${line}`),
  );

  const planBlocks = rollup.map((entry) => {
    const updated = entry.planGeneratedAt
      ? ` (plan updated ${entry.planGeneratedAt.slice(0, 10)})`
      : ' (no cached ministry plan yet)';
    const excerpt = entry.planExcerpt ?? '(none)';
    return [`### ${entry.name}${updated}`, excerpt].join('\n');
  });

  return [
    'Synthesize a church-wide leadership plan for the next 4 weeks from ministry rollups.',
    'Focus on coordination, shared resource conflicts, pastor/office follow-ups, and cross-ministry priorities.',
    'Do not invent people, emails, phones, or giving data.',
    '',
    'Urgent ministry needs:',
    ...(urgentLines.length > 0 ? urgentLines : ['- (none flagged)']),
    '',
    'Other ministry needs:',
    ...(normalLines.length > 0 ? normalLines : ['- (none flagged)']),
    '',
    'Ministry plan excerpts:',
    ...planBlocks,
    '',
    'Structure the reply as:',
    '1) Church priorities this month (3–5 bullets)',
    '2) Week 1 / Week 2 / Week 3 / Week 4 — each with 2–4 coordination actions',
    '3) Watch-outs (calendar conflicts, staffing gaps, SOP/review risks)',
    'Name ministries when relevant and point leaders to EBC APP tabs when useful.',
  ].join('\n');
}
