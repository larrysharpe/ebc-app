import type { MinistryCategory } from '@/modules/ministries/types';

import type { SopConfigStore, SopSectionConfig, SopSectionId } from '@/modules/leadership/types';

import type { SopDraft, SopQualityCheck, SopQualityResult } from './sop-editor.types';

export const SECTION_ORDER: SopSectionId[] = [
  'purpose',
  'scope',
  'structure',
  'membership',
  'meetings',
  'whenToUse',
  'responsible',
  'before',
  'steps',
  'after',
  'safety',
  'contacts',
];

export function emptySections(): Record<SopSectionId, string> {
  return SECTION_ORDER.reduce(
    (acc, id) => {
      acc[id] = '';
      return acc;
    },
    {} as Record<SopSectionId, string>,
  );
}

export function isCharterTemplate(
  templateId: string,
  config: Pick<SopConfigStore, 'templates'>,
): boolean {
  const template = config.templates.find((t) => t.id === templateId);
  return template?.kind === 'charter' || templateId === 'ministry_charter';
}

export function visibleSectionsForDraft(
  draft: SopDraft,
  sections: SopSectionConfig[],
  config: Pick<SopConfigStore, 'templates'>,
): SopSectionConfig[] {
  const isCharter = isCharterTemplate(draft.templateId, config);

  return sections.filter((section) => {
    if (!section.charterOnly) return true;
    if (isCharter) return true;
    return Boolean(draft.sections[section.id]?.trim());
  });
}

export function createDraftFromTemplate(
  templateId: string,
  config: Pick<SopConfigStore, 'templates'>,
  title?: string,
): SopDraft {
  const template = config.templates.find((t) => t.id === templateId);
  const sections = emptySections();

  if (template?.prefill) {
    for (const id of SECTION_ORDER) {
      if (template.prefill[id]) {
        sections[id] = template.prefill[id]!;
      }
    }
  }

  return {
    title: title ?? template?.suggestedTitle ?? '',
    templateId,
    sections,
  };
}

export function composeSopContent(
  draft: SopDraft,
  sections: SopConfigStore['sections'],
): string {
  const blocks = sections.map((section) => {
    const body = draft.sections[section.id].trim();
    if (!body) return '';
    return `## ${section.label}\n\n${body}`;
  }).filter(Boolean);

  return blocks.join('\n\n');
}

export function parseSopContent(
  content: string,
  title: string,
  sectionLabels: SopConfigStore['sections'],
  templateId = 'general',
): SopDraft {
  const sections = emptySections();
  const headerMap = Object.fromEntries(
    sectionLabels.map((s) => [s.label.toLowerCase(), s.id]),
  );

  const parts = content.split(/^## /m).filter(Boolean);

  for (const part of parts) {
    const newline = part.indexOf('\n');
    if (newline === -1) continue;

    const header = part.slice(0, newline).trim().toLowerCase();
    const body = part.slice(newline + 1).trim();
    const sectionId = headerMap[header];

    if (sectionId) {
      sections[sectionId] = body;
    }
  }

  const hasStructured = SECTION_ORDER.some((id) => sections[id].length > 0);

  if (!hasStructured && content.trim()) {
    sections.steps = content.trim();
  }

  return {
    title,
    templateId,
    sections,
  };
}

function countNumberedSteps(text: string): number {
  return (text.match(/^\s*\d+[\.\)]\s+/gm) ?? []).length;
}

function hasImperativeSteps(text: string): boolean {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^\s*\d+[\.\)]\s+/, '').trim())
    .filter(Boolean);

  if (lines.length === 0) return false;

  const verbPattern =
    /^(confirm|verify|check|call|send|greet|arrive|record|log|notify|ensure|assign|review|prepare|open|close|start|end|follow|contact|escort|pray|read|monitor|power|test|welcome|introduce|distribute|complete|submit|schedule|reserve|thank|report|keep|run)/i;

  const imperativeCount = lines.filter((line) => verbPattern.test(line)).length;
  return imperativeCount >= Math.min(2, lines.length);
}

function isTitleSpecific(title: string): boolean {
  const trimmed = title.trim();
  if (trimmed.length < 8) return false;
  const generic = [
    'procedure',
    'sop',
    'checklist',
    'ministry procedure',
    'new sop',
    'ministry operating charter',
  ];
  return !generic.includes(trimmed.toLowerCase());
}

export function evaluateSopQuality(
  draft: SopDraft,
  config: Pick<SopConfigStore, 'minQualityScore' | 'templates'>,
  options?: { requiresSafety?: boolean },
): SopQualityResult {
  const requiresSafety = options?.requiresSafety ?? false;
  const isCharter = isCharterTemplate(draft.templateId, config);
  const minScore = config.minQualityScore;
  const stepCount = countNumberedSteps(draft.sections.steps);

  const checks: SopQualityCheck[] = [
    {
      id: 'title',
      label: 'Clear, specific title',
      passed: isTitleSpecific(draft.title),
      tip: isCharter
        ? 'Name the ministry — e.g. "Youth Ministry operating charter".'
        : 'Use an action name — e.g. "Sunday livestream setup" not "SOP".',
      weight: 15,
    },
    {
      id: 'purpose',
      label: 'Purpose stated',
      passed: draft.sections.purpose.trim().length >= 20,
      tip: 'Explain why this matters for Ebenezer’s mission.',
      weight: 15,
    },
    {
      id: 'scope',
      label: 'Scope defined (CLC)',
      passed: !isCharter || draft.sections.scope.trim().length >= 20,
      tip: 'State what and who this charter covers — and what it does not.',
      weight: isCharter ? 10 : 0,
    },
    {
      id: 'membership',
      label: 'Membership rule stated (CLC)',
      passed: !isCharter || draft.sections.membership.trim().length >= 20,
      tip: 'Confirm active EBC membership requirement for ministry positions.',
      weight: isCharter ? 10 : 0,
    },
    {
      id: 'meetings',
      label: 'Meeting rhythm documented (CLC)',
      passed: !isCharter || draft.sections.meetings.trim().length >= 20,
      tip: 'Include type, frequency, location, time, and 24-hour change notice.',
      weight: isCharter ? 10 : 0,
    },
    {
      id: 'when',
      label: 'When to use is defined',
      passed: draft.sections.whenToUse.trim().length >= 15,
      tip: 'Name the schedule, event, or trigger so volunteers know when to open this.',
      weight: isCharter ? 5 : 10,
    },
    {
      id: 'owner',
      label: 'Responsible roles named',
      passed: draft.sections.responsible.trim().length >= 10,
      tip: 'List primary and backup contacts by role.',
      weight: 10,
    },
    {
      id: 'steps',
      label: 'At least 3 numbered steps',
      passed: stepCount >= 3,
      tip: 'Break work into single actions — one step per line, starting with a verb.',
      weight: isCharter ? 10 : 20,
    },
    {
      id: 'imperative',
      label: 'Steps use action verbs',
      passed: hasImperativeSteps(draft.sections.steps),
      tip: 'Start steps with verbs: Confirm, Greet, Log, Notify…',
      weight: 10,
    },
    {
      id: 'followup',
      label: 'Follow-up documented',
      passed: draft.sections.after.trim().length >= 15,
      tip: 'Add what happens after — logging, thank-yous, handoffs.',
      weight: 10,
    },
    {
      id: 'contacts',
      label: 'Escalation contacts listed',
      passed: draft.sections.contacts.trim().length >= 10,
      tip: 'Include church office number and who to call in an emergency.',
      weight: 10,
    },
    {
      id: 'safety',
      label: 'Safety section complete',
      passed: !requiresSafety || draft.sections.safety.trim().length >= 20,
      tip: 'Youth and outreach ministries need safety rules — two-adult policy, photos, emergencies.',
      weight: requiresSafety ? 15 : 0,
    },
  ].filter((c) => c.weight > 0);

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.filter((c) => c.passed).reduce((sum, c) => sum + c.weight, 0);
  const score = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;

  return {
    score,
    checks,
    readyToPublish: score >= minScore,
  };
}

export function getTemplatesForCategory(
  category: MinistryCategory,
  config: Pick<SopConfigStore, 'templates'>,
): SopConfigStore['templates'] {
  return config.templates.filter(
    (t) => t.enabled && t.categories.includes(category),
  );
}

export function defaultSopKind(
  templateId: string,
  config: Pick<SopConfigStore, 'templates'>,
): 'charter' | 'task' {
  return isCharterTemplate(templateId, config) ? 'charter' : 'task';
}
