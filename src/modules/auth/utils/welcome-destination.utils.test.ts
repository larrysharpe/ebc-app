import { describe, expect, it } from 'vitest';

import { resolveWelcomeNextPath } from './welcome-destination.utils';

describe('resolveWelcomeNextPath', () => {
  it('allows internal paths', () => {
    expect(resolveWelcomeNextPath('/music')).toBe('/music');
    expect(resolveWelcomeNextPath('/ministries/youth')).toBe('/ministries/youth');
  });

  it('rejects login, welcome, and external-looking values', () => {
    expect(resolveWelcomeNextPath('/login')).toBe('/');
    expect(resolveWelcomeNextPath('/welcome')).toBe('/');
    expect(resolveWelcomeNextPath('/welcome?x=1')).toBe('/');
    expect(resolveWelcomeNextPath('//evil.com')).toBe('/');
    expect(resolveWelcomeNextPath('https://evil.com')).toBe('/');
    expect(resolveWelcomeNextPath(null)).toBe('/');
  });
});
