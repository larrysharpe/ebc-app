import { describe, expect, it } from 'vitest';

import { COMBINED_CHOIR_ID, DEFAULT_CHOIR_SEED } from '../types/choir.types';
import { getActiveChoirs, getRotationChoirs } from './choir.utils';

describe('choir.utils rotation helpers', () => {
  it('keeps Combined in active choirs but not in Sunday rotation options', () => {
    const active = getActiveChoirs(DEFAULT_CHOIR_SEED);
    const rotation = getRotationChoirs(DEFAULT_CHOIR_SEED);

    expect(active.some((choir) => choir.id === COMBINED_CHOIR_ID)).toBe(true);
    expect(rotation.some((choir) => choir.id === COMBINED_CHOIR_ID)).toBe(false);
    expect(rotation.length).toBe(active.length - 1);
  });
});
