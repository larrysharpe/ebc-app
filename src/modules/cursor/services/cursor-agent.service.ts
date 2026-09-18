import { Agent, CursorAgentError, type AgentOptions, type SDKImage } from '@cursor/sdk';

import { getCursorConfig } from '@/lib/cursor';

import { buildAppControlCatalogForPrompt } from '../features/app-control/app-control.utils';
import type { CursorPromptRequest, CursorStreamEvent } from '../types/cursor.types';

function buildAgentOptions(apiKey: string, allowWrites: boolean): AgentOptions {
  const { model, cloudRepo } = getCursorConfig();

  const base: AgentOptions = {
    apiKey,
    model: { id: model },
    mode: allowWrites ? 'agent' : 'plan',
    name: allowWrites ? 'EBC Webmaster Agent' : 'EBC Ask Agent',
  };

  if (cloudRepo) {
    return {
      ...base,
      cloud: {
        repos: [{ url: cloudRepo }],
      },
    };
  }

  return {
    ...base,
    local: {
      cwd: process.cwd(),
      settingSources: allowWrites ? ['project'] : [],
    },
  };
}

function formatPromptWithContext(request: CursorPromptRequest): string {
  if (request.purpose === 'sop-section-help') {
    return [
      'You are coaching an Ebenezer Baptist Church ministry leader writing a Standard Operating Procedure in EBC APP.',
      'Guide them through ONE SOP section only. Be concise, practical, and ministry-appropriate.',
      'Do not invent member names, phone numbers, giving amounts, or other PII.',
      'Do not modify application code or files — answer in plain text only.',
      'Structure your reply as:',
      '1) Short coaching tips (3–5 bullets)',
      '2) If helpful, a suggested draft under a line that says exactly: SUGGESTED DRAFT',
      'Keep the suggested draft ready to paste into the section field.',
      '',
      request.prompt.trim(),
    ].join('\n');
  }

  if (request.purpose === 'ministry-plan-help') {
    return [
      'You are coaching an Ebenezer Baptist Church ministry leader planning the next four weeks in EBC APP.',
      'Be concise, practical, and ministry-appropriate.',
      'Do not invent member names beyond those listed, phone numbers, emails, giving amounts, or other PII.',
      'Do not modify application code or files — answer in plain text only.',
      'Follow the week-by-week structure requested in the staff message.',
      '',
      request.prompt.trim(),
    ].join('\n');
  }

  if (request.purpose === 'church-plan-help') {
    return [
      'You are coaching Ebenezer Baptist Church pastoral and office leadership with a church-wide 4-week plan.',
      'Synthesize ministry needs into coordination priorities — do not simply restate every ministry plan.',
      'Be concise, practical, and ministry-appropriate.',
      'Do not invent member names beyond those listed, phone numbers, emails, giving amounts, or other PII.',
      'Do not modify application code or files — answer in plain text only.',
      'Follow the structure requested in the staff message.',
      '',
      request.prompt.trim(),
    ].join('\n');
  }

  if (request.purpose === 'repertoire-coach-help') {
    return [
      'You are coaching an Ebenezer Baptist Church choir director on worship repertoire and rehearsals.',
      'Be concise, practical, and ministry-appropriate.',
      'Only recommend song titles that appear in the staff message lists.',
      'Do not invent member names, phone numbers, emails, giving amounts, or other PII.',
      'Do not modify application code or files — answer in plain text only.',
      'Follow the markdown heading structure requested in the staff message.',
      '',
      request.prompt.trim(),
    ].join('\n');
  }

  if (request.purpose === 'set-list-suggest-help') {
    return [
      'You are helping an Ebenezer Baptist Church choir director choose songs for one choir plan set list.',
      'Be concise, practical, and ministry-appropriate.',
      'Only use songId values from the catalog in the staff message. Never invent songs or IDs.',
      'Do not invent member names, phone numbers, emails, giving amounts, or other PII.',
      'Do not modify application code or files — reply with JSON only as requested.',
      '',
      request.prompt.trim(),
    ].join('\n');
  }

  if (request.purpose === 'event-time-suggest-help') {
    return [
      'You are a JSON API that suggests church event date/time options.',
      'Your entire reply must be a single JSON object. No markdown. No plan. No prose.',
      'First character `{`, last character `}`.',
      'Use only the calendar events and holiday list in the staff message — do not invent conflicts.',
      'Do not invent member names, phone numbers, emails, giving amounts, or other PII.',
      'Do not modify application code or files.',
      '',
      request.prompt.trim(),
    ].join('\n');
  }

  if (request.purpose === 'activity-request-review-help') {
    return [
      'You are a JSON API that reviews church activity requests for schedule conflicts and form problems.',
      'Your entire reply must be a single JSON object. No markdown. No plan. No prose.',
      'First character `{`, last character `}`.',
      'Use only the draft and nearby calendar data in the staff message — do not invent conflicts.',
      'Keep local findings; add only useful new tip/warning findings.',
      'Do not invent member names, phone numbers, emails, giving amounts, or other PII.',
      'Do not modify application code or files.',
      '',
      request.prompt.trim(),
    ].join('\n');
  }

  const lines: string[] = [
    'You are assisting Ebenezer Baptist Church staff using the EBC APP management platform.',
  ];

  if (request.allowWrites) {
    lines.push(
      'The signed-in user has the webmaster role. You MAY edit the EBC APP codebase to implement requested changes.',
      'Prefer small, focused diffs. Follow docs/engineering/standards. Do not commit or push unless explicitly asked.',
      'Do not log or expose PII, giving amounts, or secrets.',
    );
  } else {
    lines.push(
      'The signed-in user does NOT have webmaster permission.',
      'You must NOT create, edit, delete, or run mutating commands against application files.',
      'Use plan/ask mode only: explain, recommend, and outline steps. If a change is needed, say a webmaster must apply it.',
    );
  }

  lines.push('', buildAppControlCatalogForPrompt());

  if (request.pageTitle || request.pagePath) {
    lines.push(
      `Current page: ${request.pageTitle ?? 'Unknown'} (${request.pagePath ?? '/'}).`,
    );
  }

  if (request.files && request.files.length > 0) {
    lines.push('', 'Attached files saved for this request:');
    for (const file of request.files) {
      lines.push(
        `- ${file.fileName} (${file.mimeType}, ${file.sizeBytes} bytes) at ${file.absolutePath}`,
      );
    }
    lines.push('Read those paths if needed to answer or implement the request.');
  }

  if (request.images && request.images.length > 0) {
    lines.push(
      '',
      `${request.images.length} image attachment(s) are included with this message — use them as visual context.`,
    );
  }

  lines.push('', 'Staff message:', request.prompt.trim());
  return lines.join('\n');
}

function toSdkImages(request: CursorPromptRequest): SDKImage[] | undefined {
  if (!request.images?.length) return undefined;
  return request.images.map((image) => ({
    data: image.data,
    mimeType: image.mimeType,
  }));
}

export async function runCursorPrompt(
  request: CursorPromptRequest,
  onEvent: (event: CursorStreamEvent) => void,
): Promise<void> {
  const { apiKey, enabled } = getCursorConfig();

  if (!enabled || !apiKey) {
    onEvent({
      type: 'error',
      message: 'Cursor is not configured. Add CURSOR_API_KEY to your environment.',
    });
    return;
  }

  const options = buildAgentOptions(apiKey, request.allowWrites);

  try {
    await using agent = request.agentId
      ? await Agent.resume(request.agentId, options)
      : await Agent.create(options);

    onEvent({ type: 'agent', agentId: agent.agentId });

    const images = toSdkImages(request);
    const message = images
      ? { text: formatPromptWithContext(request), images }
      : formatPromptWithContext(request);

    const run = await agent.send(message, {
      mode: request.allowWrites ? 'agent' : 'plan',
    });

    for await (const event of run.stream()) {
      if (event.type === 'assistant') {
        for (const block of event.message.content) {
          if (block.type === 'text' && block.text) {
            onEvent({ type: 'text', text: block.text });
          }
        }
        continue;
      }

      if (event.type === 'tool_call') {
        onEvent({
          type: 'tool',
          name: event.name,
          status: event.status,
        });
      }
    }

    const result = await run.wait();
    onEvent({ type: 'done', status: result.status });
  } catch (error) {
    if (error instanceof CursorAgentError) {
      onEvent({
        type: 'error',
        message: error.message,
        retryable: error.isRetryable,
      });
      return;
    }

    onEvent({
      type: 'error',
      message: error instanceof Error ? error.message : 'Cursor request failed.',
    });
  }
}

/** Collect the full assistant text for non-streaming callers (jobs, services). */
export async function collectCursorPromptText(
  request: CursorPromptRequest,
): Promise<string> {
  let text = '';
  let errorMessage: string | null = null;
  let doneStatus: string | null = null;

  await runCursorPrompt(request, (event) => {
    if (event.type === 'text') {
      text += event.text;
      return;
    }
    if (event.type === 'error') {
      errorMessage = event.message;
      return;
    }
    if (event.type === 'done') {
      doneStatus = event.status;
    }
  });

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  if (doneStatus === 'error') {
    throw new Error('Cursor request completed with an error status.');
  }

  return text.trim();
}

export function getCursorStatus(canWrite = false): {
  enabled: boolean;
  runtime: 'local' | 'cloud' | 'unconfigured';
  canWrite: boolean;
} {
  const { enabled, cloudRepo } = getCursorConfig();

  if (!enabled) {
    return { enabled: false, runtime: 'unconfigured', canWrite: false };
  }

  return {
    enabled: true,
    runtime: cloudRepo ? 'cloud' : 'local',
    canWrite,
  };
}
