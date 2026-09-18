import { describe, expect, it } from 'vitest';

import { resolveRequestOrigin } from './request-origin';

describe('resolveRequestOrigin', () => {
  it('prefers Host over 0.0.0.0 bind origin', () => {
    expect(
      resolveRequestOrigin({
        host: '10.25.24.180:3000',
        forwardedHost: null,
        forwardedProto: null,
        fallbackOrigin: 'http://0.0.0.0:3000',
      }),
    ).toBe('http://10.25.24.180:3000');
  });

  it('uses x-forwarded-host and proto when present', () => {
    expect(
      resolveRequestOrigin({
        host: '0.0.0.0:3000',
        forwardedHost: 'app.example.com',
        forwardedProto: 'https',
        fallbackOrigin: 'http://0.0.0.0:3000',
      }),
    ).toBe('https://app.example.com');
  });

  it('rewrites bare 0.0.0.0 fallback to localhost', () => {
    expect(
      resolveRequestOrigin({
        host: null,
        forwardedHost: null,
        forwardedProto: null,
        fallbackOrigin: 'http://0.0.0.0:3000',
      }),
    ).toBe('http://localhost:3000');
  });
});
