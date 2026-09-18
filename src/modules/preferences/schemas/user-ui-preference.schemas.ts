import { z } from 'zod';

import { VOICE_COACH_PREFERENCES } from '../types/user-ui-preference.types';

export const updateVoiceCoachPreferenceSchema = z.object({
  voiceCoachPreference: z.enum(VOICE_COACH_PREFERENCES),
});

export type UpdateVoiceCoachPreferenceInput = z.infer<
  typeof updateVoiceCoachPreferenceSchema
>;
