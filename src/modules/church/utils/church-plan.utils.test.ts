import { describe, expect, it } from 'vitest';

import {
  buildChurchPlanPrompt,
  buildMinistryPlanRollupEntry,
  excerptSuggestedPlan,
} from './church-plan.utils';

describe('excerptSuggestedPlan', () => {
  it('returns null for empty plans', () => {
    expect(excerptSuggestedPlan(undefined)).toBeNull();
    expect(excerptSuggestedPlan('   ')).toBeNull();
  });

  it('truncates long plans', () => {
    const excerpt = excerptSuggestedPlan('a'.repeat(40), 20);
    expect(excerpt).toHaveLength(20);
    expect(excerpt?.endsWith('…')).toBe(true);
  });
});

describe('buildMinistryPlanRollupEntry', () => {
  it('splits urgent and normal signals and excerpts the plan', () => {
    const entry = buildMinistryPlanRollupEntry(
      {
        id: '1',
        slug: 'media-ministry',
        name: 'Media Ministry',
        category: 'service',
        description: '',
        personnel: [],
        events: [],
        sops: [],
        dutyCatalog: [],
        suggestedPlan: '## Week 1\n- Prep slides',
        suggestedPlanGeneratedAt: '2026-07-11T00:00:00.000Z',
      },
      [
        {
          id: 'a',
          label: 'Open role',
          detail: 'Photographer open',
          href: '/ministries/media-ministry?tab=personnel',
          tone: 'urgent',
        },
        {
          id: 'b',
          label: 'SOP review',
          detail: 'Charter due soon',
          href: '/ministries/media-ministry?tab=sops',
          tone: 'normal',
        },
      ],
    );

    expect(entry.urgentSignals).toEqual(['Open role: Photographer open']);
    expect(entry.normalSignals).toEqual(['SOP review: Charter due soon']);
    expect(entry.planExcerpt).toContain('Week 1');
  });
});

describe('buildChurchPlanPrompt', () => {
  it('includes urgent needs and excerpts', () => {
    const prompt = buildChurchPlanPrompt([
      {
        slug: 'media-ministry',
        name: 'Media Ministry',
        category: 'service',
        urgentSignals: ['Open role: Photographer open'],
        normalSignals: [],
        planExcerpt: 'Week 1 prep',
        planGeneratedAt: '2026-07-11T00:00:00.000Z',
      },
    ]);

    expect(prompt).toContain('[Media Ministry] Open role: Photographer open');
    expect(prompt).toContain('### Media Ministry');
    expect(prompt).toContain('Week 1 prep');
  });
});
