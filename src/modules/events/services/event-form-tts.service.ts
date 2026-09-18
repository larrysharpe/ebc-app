import 'server-only';

import {
  isOpenAiTtsConfigured,
  synthesizeOpenAiSpeech,
} from '../integrations/openai-tts';
import { eventFormTtsRequestSchema } from '../schemas/event-form-tts.schemas';

export type EventFormTtsServiceResult =
  | { ok: true; audio: Buffer; contentType: string }
  | { ok: false; error: string; status: number };

export async function synthesizeEventFormSpeech(
  raw: unknown,
): Promise<EventFormTtsServiceResult> {
  const parsed = eventFormTtsRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, status: 400, error: 'Nothing to speak.' };
  }

  if (!isOpenAiTtsConfigured()) {
    return {
      ok: false,
      status: 503,
      error: 'Natural voice is not configured on this server.',
    };
  }

  try {
    const result = await synthesizeOpenAiSpeech(parsed.data.text);
    if (!result.ok) {
      return {
        ok: false,
        status: result.missingKey ? 503 : 502,
        error: result.error,
      };
    }
    return {
      ok: true,
      audio: result.audio,
      contentType: result.contentType,
    };
  } catch {
    return {
      ok: false,
      status: 502,
      error: 'Could not generate spoken audio right now.',
    };
  }
}
