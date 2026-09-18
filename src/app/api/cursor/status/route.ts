import { getSession } from '@/modules/auth/services/auth.service';
import { canEditAppViaCursor } from '@/modules/auth/utils/cursor-access.utils';
import { getCursorStatus } from '@/modules/cursor/services/cursor-agent.service';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const session = await getSession();
  const canWrite = session ? canEditAppViaCursor(session) : false;
  const status = getCursorStatus(canWrite);

  return Response.json({
    ...status,
    authenticated: Boolean(session),
  });
}
