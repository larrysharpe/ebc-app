'use client';

import type { IntakePhase } from '../EventFormVoiceCoach/event-form-voice-intake.types';

export type EventFormVoiceStoryPageProps = {
  intakePhase: IntakePhase;
  isListening: boolean;
  lastHeard: string | null;
  lastReply: string | null;
  onContinue: () => void;
};

export function EventFormVoiceStoryPage({
  intakePhase,
  isListening,
  lastHeard,
  lastReply,
  onContinue,
}: EventFormVoiceStoryPageProps): React.JSX.Element {
  const canContinue = intakePhase !== 'opening' || Boolean(lastHeard);

  return (
    <div className="space-y-4 rounded-xl bg-ebc-burgundy px-4 py-6 text-white sm:px-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-white/70">
          Voice step 1
        </p>
        <h3 className="mt-1 text-xl font-semibold sm:text-2xl">
          Tell me about the event
        </h3>
        <p className="mt-3 text-base text-white/90">
          Speak everything you already know — the name, what kind of event it
          is, when and where, who to contact, about how many people, and any
          media, kitchen, or room setup needs.
        </p>
        <p className="mt-2 text-base text-white/90">
          Take your time. When you pause, I will ask short follow-up questions
          for anything still missing. You can also skip ahead to the form
          anytime.
        </p>
      </div>

      <p
        className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium"
        role="status"
      >
        {isListening
          ? intakePhase === 'opening'
            ? 'Listening… go ahead and speak.'
            : intakePhase === 'clarifying'
              ? 'Listening for your answer to the follow-up.'
              : 'Listening — you can keep adding details.'
          : 'Tap Start listening below if the mic is not on yet.'}
      </p>

      {lastHeard ? (
        <p className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm text-white/95">
          Heard: “{lastHeard}”
        </p>
      ) : null}

      {lastReply ? (
        <p className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm text-white/95">
          Coach: {lastReply}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onContinue}
        className="ebc-choice min-h-11 w-full border-white/40 bg-white text-ebc-burgundy hover:bg-white"
      >
        <span className="text-base font-semibold">
          {canContinue ? 'Continue to the form' : 'Skip to the form'}
        </span>
      </button>
    </div>
  );
}
