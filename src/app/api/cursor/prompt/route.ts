import { getSession } from '@/modules/auth/services/auth.service';
import { canEditAppViaCursor } from '@/modules/auth/utils/cursor-access.utils';
import { runCursorPrompt } from '@/modules/cursor/services/cursor-agent.service';
import type { CursorPromptPurpose, CursorPromptRequest } from '@/modules/cursor/types/cursor.types';
import { parseCursorUploadFiles } from '@/modules/cursor/utils/cursor-upload.utils';

export const runtime = 'nodejs';
export const maxDuration = 300;

const MAX_PROMPT_LENGTH = 8000;

function parseCursorPurpose(value: unknown): CursorPromptPurpose {
  if (
    value === 'sop-section-help' ||
    value === 'ministry-plan-help' ||
    value === 'church-plan-help' ||
    value === 'general'
  ) {
    return value;
  }
  return 'general';
}

function isAskOnlyPurpose(purpose: CursorPromptPurpose): boolean {
  return (
    purpose === 'sop-section-help' ||
    purpose === 'ministry-plan-help' ||
    purpose === 'church-plan-help'
  );
}

async function parseJsonBody(request: Request): Promise<CursorPromptRequest | { error: string }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: 'Invalid JSON body.' };
  }

  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request body.' };
  }

  const record = body as Record<string, unknown>;
  const prompt = typeof record.prompt === 'string' ? record.prompt.trim() : '';

  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return {
      error: `Prompt is required and must be under ${MAX_PROMPT_LENGTH} characters.`,
    };
  }

  return {
    prompt,
    agentId: typeof record.agentId === 'string' ? record.agentId : undefined,
    pagePath: typeof record.pagePath === 'string' ? record.pagePath : undefined,
    pageTitle: typeof record.pageTitle === 'string' ? record.pageTitle : undefined,
    purpose: parseCursorPurpose(record.purpose),
    allowWrites: false,
    images: [],
    files: [],
  };
}

async function parseMultipartBody(
  request: Request,
): Promise<CursorPromptRequest | { error: string }> {
  const form = await request.formData();
  const prompt = String(form.get('prompt') ?? '').trim();

  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return {
      error: `Prompt is required and must be under ${MAX_PROMPT_LENGTH} characters.`,
    };
  }

  const uploaded = form.getAll('files').filter((entry): entry is File => entry instanceof File);
  const parsedUploads = await parseCursorUploadFiles(uploaded);
  if (!parsedUploads.ok) {
    return { error: parsedUploads.error };
  }

  return {
    prompt,
    agentId: String(form.get('agentId') ?? '') || undefined,
    pagePath: String(form.get('pagePath') ?? '') || undefined,
    pageTitle: String(form.get('pageTitle') ?? '') || undefined,
    purpose: parseCursorPurpose(form.get('purpose')),
    allowWrites: false,
    images: parsedUploads.uploads.images,
    files: parsedUploads.uploads.files,
  };
}

export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  const parsed = contentType.includes('multipart/form-data')
    ? await parseMultipartBody(request)
    : await parseJsonBody(request);

  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const allowWrites =
    canEditAppViaCursor(session) && !isAskOnlyPurpose(parsed.purpose ?? 'general');
  const securedRequest: CursorPromptRequest = {
    ...parsed,
    allowWrites,
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      await runCursorPrompt(securedRequest, (payload) => {
        send(payload.type, payload);
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
