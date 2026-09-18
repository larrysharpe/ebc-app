import { describe, expect, it } from 'vitest';

import { buildSmsText, normalizePhoneE164 } from './sms.utils';

describe('normalizePhoneE164', () => {
  it('normalizes 10-digit US numbers', () => {
    expect(normalizePhoneE164('(703) 555-0100')).toBe('+17035550100');
  });

  it('keeps E.164 as-is', () => {
    expect(normalizePhoneE164('+17035550100')).toBe('+17035550100');
  });

  it('rejects unusable values', () => {
    expect(normalizePhoneE164('')).toBeNull();
    expect(normalizePhoneE164('123')).toBeNull();
    expect(normalizePhoneE164(null)).toBeNull();
  });
});

describe('buildSmsText', () => {
  it('appends absolute app link', () => {
    expect(
      buildSmsText({
        body: 'Choir plan shared.',
        href: '/music/plans/p1/rehearse',
        appOrigin: 'https://app.example',
      }),
    ).toBe('Choir plan shared.\nhttps://app.example/music/plans/p1/rehearse');
  });

  it('truncates long bodies', () => {
    const body = 'x'.repeat(1600);
    const text = buildSmsText({ body });
    expect(text.length).toBeLessThanOrEqual(1500);
    expect(text.endsWith('…')).toBe(true);
  });
});
