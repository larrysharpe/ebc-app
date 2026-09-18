import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { signOut } from '@/modules/auth/services/auth.service';
import { absoluteUrl } from '@/lib/request-origin';

export async function POST(request: NextRequest): Promise<NextResponse> {
  await signOut();
  return NextResponse.redirect(absoluteUrl(request, '/login'));
}
