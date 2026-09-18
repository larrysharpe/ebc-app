import { z } from 'zod';

import { OPENAI_TTS_MAX_CHARS } from '../integrations/openai-tts/openai-tts.constants';

export const eventFormTtsRequestSchema = z.object({
  text: z.string().trim().min(1).max(OPENAI_TTS_MAX_CHARS),
});

export type EventFormTtsRequest = z.infer<typeof eventFormTtsRequestSchema>;
