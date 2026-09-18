import type { SopSectionConfig } from '@/modules/leadership/types';

export type SopSectionHelpContext = {
  ministryName: string;
  ministryCategory: string;
  sopTitle: string;
  templateId: string;
  isCharter: boolean;
  section: Pick<SopSectionConfig, 'id' | 'label' | 'hint' | 'placeholder'>;
  currentValue: string;
};

const SUGGESTED_DRAFT_MARKER = /^SUGGESTED DRAFT\s*$/im;

export function buildSopSectionHelpPrompt(context: SopSectionHelpContext): string {
  const current = context.currentValue.trim();
  const lines = [
    `Ministry: ${context.ministryName} (${context.ministryCategory})`,
    `SOP title: ${context.sopTitle || '(untitled)'}`,
    `Template: ${context.templateId}${context.isCharter ? ' — ministry charter (CLC)' : ' — task procedure'}`,
    `Section: ${context.section.label} (id: ${context.section.id})`,
    `Section guidance shown in the app: ${context.section.hint}`,
    `Placeholder example: ${context.section.placeholder}`,
    '',
    current
      ? `Current draft in this section:\n${current}`
      : 'Current draft in this section: (empty)',
    '',
    current
      ? 'Coach the leader on improving this section. Point out gaps against the CLC / church SOP standard when relevant. Include a revised SUGGESTED DRAFT they can paste.'
      : 'The field is empty. Coach them on what to write, then provide a SUGGESTED DRAFT tailored to this ministry.',
  ];

  return lines.join('\n');
}

export function extractSuggestedDraft(response: string): string | null {
  const match = SUGGESTED_DRAFT_MARKER.exec(response);
  if (!match || match.index === undefined) return null;

  const after = response.slice(match.index + match[0].length).trim();
  if (!after) return null;

  // Stop at a trailing coaching footer if the model adds one after the draft
  const nextHeading = after.search(/\n#{1,3}\s|\n\*\*[A-Z][^*]+\*\*\s*$/m);
  const draft = (nextHeading === -1 ? after : after.slice(0, nextHeading)).trim();

  // Strip surrounding code fences if present
  const fenced = draft.match(/^```(?:\w+)?\n([\s\S]*?)\n```$/);
  return (fenced?.[1] ?? draft).trim() || null;
}

export function coachingTextWithoutDraft(response: string): string {
  const match = SUGGESTED_DRAFT_MARKER.exec(response);
  if (!match || match.index === undefined) return response.trim();
  return response.slice(0, match.index).trim();
}
