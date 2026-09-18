import 'server-only';

import {
  OPENAI_SPEECH_URL,
  OPENAI_TTS_FORMAT,
  OPENAI_TTS_MODEL,
  OPENAI_TTS_VOICE,
} from './openai-tts.constants';

export type OpenAiTtsResult =
  | { ok: true; audio: Buffer; contentType: string }
  | { ok: false; error: string; missingKey?: boolean };

export function isOpenAiTtsConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function synthesizeOpenAiSpeech(
  text: string,
): Promise<OpenAiTtsResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      missingKey: true,
      error: 'Voice speech is not configured.',
    };
  }

  const response = await fetch(OPENAI_SPEECH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_TTS_MODEL,
      voice: OPENAI_TTS_VOICE,
      input: text,
      response_format: OPENAI_TTS_FORMAT,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      error: 'Could not generate spoken audio right now.',
    };
  }

  const audio = Buffer.from(await response.arrayBuffer());
  return {
    ok: true,
    audio,
    contentType: 'audio/mpeg',
  };
}
