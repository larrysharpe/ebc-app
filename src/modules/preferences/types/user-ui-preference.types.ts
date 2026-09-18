export const VOICE_COACH_PREFERENCES = ['ask', 'on', 'off'] as const;

export type VoiceCoachPreference = (typeof VOICE_COACH_PREFERENCES)[number];

export const VOICE_COACH_PREFERENCE_LABELS: Record<VoiceCoachPreference, string> = {
  ask: 'Ask me each time',
  on: 'Always use voice coach',
  off: "Don't offer voice coach",
};

export const VOICE_COACH_PREFERENCE_HELP: Record<VoiceCoachPreference, string> = {
  ask: 'Show the voice coach question when you create an event.',
  on: 'Start listening and guiding by voice as soon as you add an event.',
  off: 'Skip the voice coach and go straight to typing the form.',
};

export type UserUiPreferences = {
  voiceCoachPreference: VoiceCoachPreference;
};

export function defaultUserUiPreferences(): UserUiPreferences {
  return { voiceCoachPreference: 'ask' };
}

export function isVoiceCoachPreference(
  value: string,
): value is VoiceCoachPreference {
  return (VOICE_COACH_PREFERENCES as readonly string[]).includes(value);
}
