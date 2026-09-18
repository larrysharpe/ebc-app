import { NextResponse } from 'next/server';

import { getSession } from '@/modules/auth/services/auth.service';
import { canAccessMinistrySlug } from '@/modules/auth/utils/ministry-scope.utils';
import { prisma } from '@/lib/db';
import { readMediaBytes } from '@/modules/ministries/services/ministry-media.service';

type RouteContext = {
  params: Promise<{ assetId: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { assetId } = await context.params;
  const payload = await readMediaBytes(assetId);
  if (!payload) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const ministryRow = await prisma.ministry.findUnique({
    where: { id: payload.asset.ministryId },
    select: { slug: true },
  });
  if (!ministryRow || !canAccessMinistrySlug(session, ministryRow.slug)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return new NextResponse(new Uint8Array(payload.body), {
    status: 200,
    headers: {
      'Content-Type': payload.asset.mimeType,
      'Content-Length': String(payload.body.byteLength),
      'Content-Disposition': `inline; filename="${payload.asset.fileName}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
