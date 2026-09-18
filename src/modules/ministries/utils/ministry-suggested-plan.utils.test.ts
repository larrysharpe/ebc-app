import { describe, expect, it } from 'vitest';

import type { Ministry } from '../types';
import {
  formatSuggestedPlanGeneratedAt,
  isSuggestedPlanStale,
  sortMinistriesForSuggestedPlanRefresh,
} from './ministry-suggested-plan.utils';

function ministry(partial: Partial<Ministry> & Pick<Ministry, 'id' | 'slug'>): Ministry {
  return {
    name: partial.name ?? partial.slug,
    category: 'service',
    description: '',
    personnel: [],
    events: [],
    sops: [],
    dutyCatalog: [],
    ...partial,
  };
}

describe('isSuggestedPlanStale', () => {
  const now = new Date('2026-07-11T12:00:00.000Z');

  it('treats missing timestamp as stale', () => {
    expect(isSuggestedPlanStale(undefined, 24, now)).toBe(true);
  });

  it('treats recent plans as fresh', () => {
    expect(isSuggestedPlanStale('2026-07-11T06:00:00.000Z', 24, now)).toBe(false);
  });

  it('treats plans older than max age as stale', () => {
    expect(isSuggestedPlanStale('2026-07-10T11:00:00.000Z', 24, now)).toBe(true);
  });
});

describe('sortMinistriesForSuggestedPlanRefresh', () => {
  it('prioritizes never-generated, then oldest', () => {
    const sorted = sortMinistriesForSuggestedPlanRefresh([
      ministry({
        id: '1',
        slug: 'recent',
        suggestedPlanGeneratedAt: '2026-07-11T10:00:00.000Z',
      }),
      ministry({ id: '2', slug: 'never' }),
      ministry({
        id: '3',
        slug: 'old',
        suggestedPlanGeneratedAt: '2026-07-01T00:00:00.000Z',
      }),
    ]);

    expect(sorted.map((row) => row.slug)).toEqual(['never', 'old', 'recent']);
  });
});

describe('formatSuggestedPlanGeneratedAt', () => {
  it('formats relative ages', () => {
    const now = new Date('2026-07-11T12:00:00.000Z');
    expect(formatSuggestedPlanGeneratedAt('2026-07-11T11:30:00.000Z', now)).toBe('30m ago');
    expect(formatSuggestedPlanGeneratedAt('2026-07-11T09:00:00.000Z', now)).toBe('3h ago');
  });
});
