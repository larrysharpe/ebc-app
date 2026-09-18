import { describe, expect, it } from 'vitest';

import { SOP_CONFIG_SEED } from '@/modules/leadership/data/sop-config.seed';

import {
  composeSopContent,
  createDraftFromTemplate,
  evaluateSopQuality,
  isCharterTemplate,
  parseSopContent,
  visibleSectionsForDraft,
} from './sop-editor.utils';

describe('SOP CLC charter helpers', () => {
  it('marks ministry_charter as a charter template', () => {
    expect(isCharterTemplate('ministry_charter', SOP_CONFIG_SEED)).toBe(true);
    expect(isCharterTemplate('general', SOP_CONFIG_SEED)).toBe(false);
  });

  it('prefills CLC membership and meeting guidance from the charter template', () => {
    const draft = createDraftFromTemplate('ministry_charter', SOP_CONFIG_SEED);
    expect(draft.sections.membership).toMatch(/active members of Ebenezer Baptist Church/i);
    expect(draft.sections.meetings).toMatch(/24 hours/i);
    expect(draft.templateId).toBe('ministry_charter');
  });

  it('shows charter-only sections for charter drafts', () => {
    const draft = createDraftFromTemplate('ministry_charter', SOP_CONFIG_SEED);
    const visible = visibleSectionsForDraft(draft, SOP_CONFIG_SEED.sections, SOP_CONFIG_SEED);
    const ids = visible.map((s) => s.id);
    expect(ids).toContain('scope');
    expect(ids).toContain('membership');
    expect(ids).toContain('meetings');
  });

  it('hides empty charter-only sections for task drafts', () => {
    const draft = createDraftFromTemplate('general', SOP_CONFIG_SEED);
    const visible = visibleSectionsForDraft(draft, SOP_CONFIG_SEED.sections, SOP_CONFIG_SEED);
    const ids = visible.map((s) => s.id);
    expect(ids).not.toContain('scope');
    expect(ids).not.toContain('membership');
    expect(ids).toContain('purpose');
    expect(ids).toContain('steps');
  });

  it('round-trips charter sections through compose and parse', () => {
    const draft = createDraftFromTemplate('ministry_charter', SOP_CONFIG_SEED, 'Youth Ministry charter');
    draft.sections.purpose = 'Equip youth under 19 for discipleship and fellowship.';
    draft.sections.scope = 'Covers Youth Ministry gatherings in the FLC. Does not cover VBS.';
    const content = composeSopContent(draft, SOP_CONFIG_SEED.sections);
    const parsed = parseSopContent(
      content,
      draft.title,
      SOP_CONFIG_SEED.sections,
      'ministry_charter',
    );
    expect(parsed.sections.scope).toMatch(/Does not cover VBS/);
    expect(parsed.sections.membership).toMatch(/active members/i);
    expect(parsed.templateId).toBe('ministry_charter');
  });

  it('scores charter quality with CLC section checks', () => {
    const draft = createDraftFromTemplate(
      'ministry_charter',
      SOP_CONFIG_SEED,
      'Youth Ministry operating charter',
    );
    draft.sections.purpose =
      'Equip young people under 19 for spiritual growth and family discipleship.';
    draft.sections.scope =
      'Covers Youth Ministry gatherings for ages under 19. Does not cover Vacation Bible School.';
    draft.sections.structure =
      'Director — program oversight\nAdvisors — classroom support\nVolunteers — check-in and activities';
    const result = evaluateSopQuality(draft, SOP_CONFIG_SEED, { requiresSafety: true });
    expect(result.checks.some((c) => c.id === 'scope' && c.passed)).toBe(true);
    expect(result.checks.some((c) => c.id === 'membership' && c.passed)).toBe(true);
    expect(result.checks.some((c) => c.id === 'meetings' && c.passed)).toBe(true);
  });
});
