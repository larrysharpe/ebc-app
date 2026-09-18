'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { updateVoiceCoachPreferenceAction } from '../../actions/user-ui-preference.actions';
import {
  VOICE_COACH_PREFERENCE_HELP,
  VOICE_COACH_PREFERENCE_LABELS,
  VOICE_COACH_PREFERENCES,
  type UserUiPreferences,
  type VoiceCoachPreference,
} from '../../types/user-ui-preference.types';

export type UserPreferencesPanelProps = {
  preferences: UserUiPreferences;
};

export function UserPreferencesPanel({
  preferences,
}: UserPreferencesPanelProps): React.JSX.Element {
  const router = useRouter();
  const [voiceCoachPreference, setVoiceCoachPreference] =
    useState<VoiceCoachPreference>(preferences.voiceCoachPreference);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save(next: VoiceCoachPreference): void {
    setVoiceCoachPreference(next);
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateVoiceCoachPreferenceAction({
        voiceCoachPreference: next,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess('Saved.');
      router.refresh();
    });
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-lg font-bold text-ebc-burgundy">Voice coach</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose whether the event form offers voice help when you create an
          event. You can change this anytime.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="sr-only">Voice coach preference</legend>
        {VOICE_COACH_PREFERENCES.map((option) => {
          const selected = voiceCoachPreference === option;
          return (
            <label
              key={option}
              className={`ebc-choice min-h-11 ${
                selected ? 'ebc-choice-selected' : 'ebc-choice-idle'
              }`}
            >
              <input
                type="radio"
                name="voiceCoachPreference"
                value={option}
                checked={selected}
                disabled={isPending}
                onChange={() => save(option)}
                className="h-4 w-4 shrink-0 border-slate-300"
              />
              <span>
                <span className="block text-sm font-medium">
                  {VOICE_COACH_PREFERENCE_LABELS[option]}
                </span>
                <span className="mt-0.5 block text-xs font-normal text-slate-500">
                  {VOICE_COACH_PREFERENCE_HELP[option]}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-ebc-green/30 bg-ebc-green/5 px-3 py-2 text-sm text-ebc-green-dark">
          {success}
        </p>
      ) : null}
      {isPending ? (
        <p className="text-sm text-slate-500">Saving…</p>
      ) : null}
    </section>
  );
}
