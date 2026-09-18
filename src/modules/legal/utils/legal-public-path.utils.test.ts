import { describe, expect, it } from 'vitest';

import { isLegalPublicPath } from './legal-public-path.utils';

describe('isLegalPublicPath', () => {
  it('allows the legal hub and documents', () => {
    expect(isLegalPublicPath('/legal')).toBe(true);
    expect(isLegalPublicPath('/legal/privacy')).toBe(true);
    expect(isLegalPublicPath('/legal/terms')).toBe(true);
  });

  it('does not treat other routes as legal pages', () => {
    expect(isLegalPublicPath('/login')).toBe(false);
    expect(isLegalPublicPath('/members')).toBe(false);
    expect(isLegalPublicPath('/legalism')).toBe(false);
  });
});
