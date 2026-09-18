import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/modules/auth/constants/auth.constants';
import { canAccessRoute } from '@/modules/auth/utils/route-access.utils';
import { readSessionToken } from '@/modules/auth/utils/session.utils';
import { absoluteUrl } from '@/lib/request-origin';

function isPublicPath(pathname: string): boolean {
  if (pathname === '/login') return true;
  if (pathname === '/legal' || pathname.startsWith('/legal/')) return true;
  if (pathname === '/speech' || pathname.startsWith('/speech/')) return true;
  if (pathname.startsWith('/api/auth/')) return true;
  if (pathname === '/api/cursor/status') return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/branding')) return true;
  if (pathname === '/favicon.ico') return true;
  return /\.[a-z0-9]+$/i.test(pathname);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
    }
    const loginUrl = absoluteUrl(request, '/login');
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // API routes enforce their own authz; skip page ROUTE_ACCESS checks.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (!canAccessRoute(
    { roles: session.roles, ministryIds: session.ministryIds },
    pathname,
  )) {
    return NextResponse.redirect(absoluteUrl(request, '/?denied=1'));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
