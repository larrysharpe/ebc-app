import { describe, expect, it } from 'vitest';

import {
  buildSopSectionHelpPrompt,
  coachingTextWithoutDraft,
  extractSuggestedDraft,
} from './sop-section-help.utils';

const baseContext = {
  ministryName: 'Youth Ministry',
  ministryCategory: 'fellowship',
  sopTitle: 'Youth Ministry operating charter',
  templateId: 'ministry_charter',
  isCharter: true,
  section: {
    id: 'scope' as const,
    label: 'Scope',
    hint: 'What and who this SOP covers',
    placeholder: 'e.g. Covers youth under 19',
  },
  currentValue: '',
};

describe('buildSopSectionHelpPrompt', () => {
  it('includes ministry, section, and empty-draft coaching ask', () => {
    const prompt = buildSopSectionHelpPrompt(baseContext);
    expect(prompt).toContain('Youth Ministry');
    expect(prompt).toContain('Section: Scope');
    expect(prompt).toContain('(empty)');
    expect(prompt).toContain('SUGGESTED DRAFT');
  });

  it('asks for improvement when a draft already exists', () => {
    const prompt = buildSopSectionHelpPrompt({
      ...baseContext,
      currentValue: 'Covers youth gatherings in the FLC.',
    });
    expect(prompt).toContain('Covers youth gatherings');
    expect(prompt).toMatch(/improving this section/i);
  });
});

describe('extractSuggestedDraft', () => {
  it('extracts text after the SUGGESTED DRAFT marker', () => {
    const response = [
      '- Tip one',
      '- Tip two',
      '',
      'SUGGESTED DRAFT',
      'Covers Youth Ministry gatherings for ages under 19 in the FLC.',
      'Does not cover Vacation Bible School.',
    ].join('\n');

    expect(extractSuggestedDraft(response)).toBe(
      'Covers Youth Ministry gatherings for ages under 19 in the FLC.\nDoes not cover Vacation Bible School.',
    );
  });

  it('unwraps fenced drafts', () => {
    const response = 'Tips here\n\nSUGGESTED DRAFT\n```\nLine A\nLine B\n```';
    expect(extractSuggestedDraft(response)).toBe('Line A\nLine B');
  });

  it('returns null when marker is missing', () => {
    expect(extractSuggestedDraft('Just tips, no draft')).toBeNull();
  });
});

describe('coachingTextWithoutDraft', () => {
  it('strips the suggested draft block', () => {
    const response = 'Tip A\nTip B\n\nSUGGESTED DRAFT\nDraft body';
    expect(coachingTextWithoutDraft(response)).toBe('Tip A\nTip B');
  });
});
