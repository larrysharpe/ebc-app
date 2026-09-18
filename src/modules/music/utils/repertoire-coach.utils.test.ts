import { describe, expect, it } from 'vitest';

import type { RepertoireSnapshot } from './repertoire.utils';
import { buildRepertoireCoachPrompt } from './repertoire-coach.utils';

const snapshot: RepertoireSnapshot = {
  asOf: '2026-07-18',
  trending: [
    {
      songId: 'a',
      title: 'Total Praise',
      themes: ['worship'],
      timesSung: 3,
      lastSungDate: '2026-07-05',
      daysSinceLastSung: 13,
      choirGroups: ['senior'],
    },
  ],
  resting: [],
  neverSung: [
    {
      songId: 'b',
      title: 'New Anthem',
      themes: ['sermonic'],
      timesSung: 0,
      daysSinceLastSung: null,
      choirGroups: [],
    },
  ],
  recentThemes: ['worship'],
};

describe('buildRepertoireCoachPrompt', () => {
  it('includes trending and never-sung song titles and required headings', () => {
    const prompt = buildRepertoireCoachPrompt({
      snapshot,
      upcomingPlans: [],
      draftCount: 1,
      now: new Date('2026-07-18T12:00:00'),
    });

    expect(prompt).toContain('Total Praise');
    expect(prompt).toContain('New Anthem');
    expect(prompt).toContain("## What's trending");
    expect(prompt).toContain('## Rehearsal focus');
    expect(prompt).toContain('Open drafts: 1');
  });
});
