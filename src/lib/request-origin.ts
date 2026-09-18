import type { NextRequest } from 'next/server';

/**
 * Build the public origin for redirects.
 * When Next is bound to `0.0.0.0`, `request.url` can use that host — prefer Host /
 * X-Forwarded-* so logout and auth redirects keep the client's domain/IP.
 */
export function resolveRequestOrigin(input: {
  host: string | null;
  forwardedHost: string | null;
  forwardedProto: string | null;
  fallbackOrigin: string;
}): string {
  const host = (input.forwardedHost ?? input.host ?? '')
    .split(',')[0]
    ?.trim();
  const proto =
    input.forwardedProto?.split(',')[0]?.trim() ||
    (input.fallbackOrigin.startsWith('https') ? 'https' : 'http');

  if (host && host !== '0.0.0.0' && !host.startsWith('0.0.0.0:')) {
    return `${proto}://${host}`;
  }

  try {
    const url = new URL(input.fallbackOrigin);
    if (url.hostname === '0.0.0.0' || url.hostname === '[::]' || url.hostname === '::') {
      url.hostname = 'localhost';
    }
    return url.origin;
  } catch {
    return 'http://localhost:3000';
  }
}

export function getRequestOrigin(request: NextRequest): string {
  return resolveRequestOrigin({
    host: request.headers.get('host'),
    forwardedHost: request.headers.get('x-forwarded-host'),
    forwardedProto: request.headers.get('x-forwarded-proto'),
    fallbackOrigin: request.nextUrl.origin,
  });
}

export function absoluteUrl(request: NextRequest, pathname: string): URL {
  return new URL(pathname, getRequestOrigin(request));
}
