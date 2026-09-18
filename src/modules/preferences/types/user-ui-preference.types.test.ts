import { describe, expect, it } from 'vitest';

import {
  defaultUserUiPreferences,
  isVoiceCoachPreference,
} from './user-ui-preference.types';

describe('user ui preference helpers', () => {
  it('defaults to ask', () => {
    expect(defaultUserUiPreferences()).toEqual({
      voiceCoachPreference: 'ask',
    });
  });

  it('validates preference values', () => {
    expect(isVoiceCoachPreference('ask')).toBe(true);
    expect(isVoiceCoachPreference('on')).toBe(true);
    expect(isVoiceCoachPreference('off')).toBe(true);
    expect(isVoiceCoachPreference('maybe')).toBe(false);
  });
});
