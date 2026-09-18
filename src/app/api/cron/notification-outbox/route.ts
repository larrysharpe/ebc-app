import { NextResponse } from 'next/server';

import { processPendingOutbox } from '@/modules/notifications/services/notification-outbox.service';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

/**
 * Retry pending NotificationOutbox rows (email / push / SMS) once providers
 * are configured. Auth: `Authorization: Bearer $CRON_SECRET`
 */
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam
    ? Math.min(100, Math.max(1, Number.parseInt(limitParam, 10) || 50))
    : 50;

  const result = await processPendingOutbox(limit);
  return NextResponse.json({ ok: true, ...result });
}
