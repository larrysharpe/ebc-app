import { describe, expect, it } from 'vitest';

import { normalizeRoles } from '@/modules/auth/utils/roles.utils';

describe('normalizeRoles', () => {
  it('deduplicates roles', () => {
    expect(normalizeRoles(['choir_member', 'choir_member'])).toEqual(['choir_member']);
  });

  it('maps legacy roles', () => {
    expect(normalizeRoles(['music_director', 'musician'])).toEqual([
      'music_minister',
      'band_member',
    ]);
  });
});
