import { describe, expect, it } from 'vitest';

import {
  canPlanForChoir,
  choirIdsForRoles,
  formatChoirScopeLabels,
  resolveScopedChoirIds,
} from './choir-scope.utils';

describe('choir-scope.utils', () => {
  it('keeps choirIds only for choir directors', () => {
    expect(choirIdsForRoles(['choir_director'], ['adult', 'senior'])).toEqual([
      'adult',
      'senior',
    ]);
    expect(choirIdsForRoles(['music_minister'], ['adult'])).toEqual([]);
    expect(choirIdsForRoles(['choir_member'], ['adult'])).toEqual([]);
  });

  it('prefers assigned choir ids over roster fallback', () => {
    expect(resolveScopedChoirIds(['adult'], ['senior', 'youth'])).toEqual([
      'adult',
    ]);
    expect(resolveScopedChoirIds([], ['senior', 'youth'])).toEqual([
      'senior',
      'youth',
    ]);
  });

  it('formats choir labels from options', () => {
    expect(
      formatChoirScopeLabels(
        ['adult', 'senior'],
        [
          { id: 'adult', name: 'Adult Choir' },
          { id: 'senior', name: 'Senior Choir' },
        ],
      ),
    ).toBe('Adult Choir · Senior Choir');
  });

  it('checks plan permission against assigned choirs', () => {
    expect(
      canPlanForChoir(
        { roles: ['choir_director'], choirIds: ['adult'] },
        'adult',
        { seeAll: false },
      ),
    ).toBe(true);
    expect(
      canPlanForChoir(
        { roles: ['choir_director'], choirIds: ['adult'] },
        'senior',
        { seeAll: false },
      ),
    ).toBe(false);
    expect(
      canPlanForChoir(
        { roles: ['choir_director'], choirIds: [] },
        'senior',
        { seeAll: false, fallbackChoirIds: ['senior'] },
      ),
    ).toBe(true);
    expect(
      canPlanForChoir(
        { roles: ['music_minister'], choirIds: [] },
        'mens',
        { seeAll: true },
      ),
    ).toBe(true);
  });
});
