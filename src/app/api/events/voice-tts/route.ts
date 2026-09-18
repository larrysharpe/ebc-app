import { getSession } from '@/modules/auth/services/auth.service';
import { synthesizeEventFormSpeech } from '@/modules/events/services/event-form-tts.service';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const result = await synthesizeEventFormSpeech(body);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return new Response(new Uint8Array(result.audio), {
    status: 200,
    headers: {
      'Content-Type': result.contentType,
      'Cache-Control': 'no-store',
    },
  });
}
