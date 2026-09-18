'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import type { EventFormStepId } from '../../church-event-form.constants';
import type { EventFormIntakePatch } from './event-form-voice-intake.utils';
import type { IntakePhase } from './event-form-voice-intake.types';
import type { EventFormVoiceCommand } from './event-form-voice.utils';
import { useEventFormVoice } from './use-event-form-voice';

export type EventFormVoiceCoachProps = {
  step: EventFormStepId;
  enabled: boolean;
  /**
   * Incrementing nonce from the Yes click (or preference=on). Each new value
   * starts listening + the opening prompt immediately.
   */
  sessionNonce?: number;
  onEnabledChange: (enabled: boolean) => void;
  onIntakePatch: (patch: EventFormIntakePatch) => void;
  onCommand: (command: EventFormVoiceCommand) => string | void;
  onIntakePhaseChange?: (phase: IntakePhase) => void;
  onStatusChange?: (status: EventFormVoiceCoachStatus) => void;
  /** Spoken notice from the form (e.g. suggestion results). */
  announceText?: string | null;
  /** Hide the outer chrome when embedded in the story page. */
  embedded?: boolean;
};

export type EventFormVoiceCoachStatus = {
  intakePhase: IntakePhase;
  isListening: boolean;
  lastHeard: string | null;
  lastReply: string | null;
};

export function EventFormVoiceCoach({
  step,
  enabled,
  sessionNonce = 0,
  onEnabledChange,
  onIntakePatch,
  onCommand,
  onIntakePhaseChange,
  onStatusChange,
  announceText = null,
  embedded = false,
}: EventFormVoiceCoachProps): React.JSX.Element | null {
  const voice = useEventFormVoice({
    step,
    enabled,
    onIntakePatch,
    onCommand,
  });
  const lastAnnounceRef = useRef<string | null>(null);
  const lastSessionNonceRef = useRef(0);
  const startListeningRef = useRef(voice.startListening);
  const onIntakePhaseChangeRef = useRef(onIntakePhaseChange);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    startListeningRef.current = voice.startListening;
  }, [voice.startListening]);

  useEffect(() => {
    onIntakePhaseChangeRef.current = onIntakePhaseChange;
  }, [onIntakePhaseChange]);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    onIntakePhaseChangeRef.current?.(voice.intakePhase);
  }, [voice.intakePhase]);

  useEffect(() => {
    onStatusChangeRef.current?.({
      intakePhase: voice.intakePhase,
      isListening: voice.isListening,
      lastHeard: voice.lastHeard,
      lastReply: voice.lastReply,
    });
  }, [
    voice.intakePhase,
    voice.isListening,
    voice.lastHeard,
    voice.lastReply,
  ]);

  // Start in layout so Yes-click audio unlock still counts for playback.
  useLayoutEffect(() => {
    if (!enabled || sessionNonce <= 0) return;
    if (sessionNonce === lastSessionNonceRef.current) return;
    lastSessionNonceRef.current = sessionNonce;
    startListeningRef.current();
  }, [enabled, sessionNonce]);

  useEffect(() => {
    if (!enabled || !announceText) return;
    if (announceText === lastAnnounceRef.current) return;
    lastAnnounceRef.current = announceText;
    voice.speakGuidance(announceText);
  }, [announceText, enabled, voice.speakGuidance]);

  if (!enabled) return null;

  const phaseLabel =
    voice.intakePhase === 'opening'
      ? 'Listening — tell me about the event'
      : voice.intakePhase === 'clarifying'
        ? 'Asking follow-up questions'
        : 'Ready — you can review or continue';

  const controls = (
    <div className="space-y-3">
      {!embedded ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-ebc-burgundy">
              Voice coach
            </h3>
            <p className="mt-1 text-sm font-medium text-ebc-burgundy">
              {phaseLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEnabledChange(false)}
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Turn off voice
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-ebc-burgundy">{phaseLabel}</p>
          <button
            type="button"
            onClick={() => onEnabledChange(false)}
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Turn off voice
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={voice.toggleListening}
          className={`min-h-11 w-full rounded-lg px-4 py-2.5 text-base font-medium sm:w-auto ${
            voice.isListening
              ? 'bg-ebc-burgundy text-white'
              : 'ebc-action-primary'
          }`}
        >
          {voice.isListening
            ? voice.isSpeaking
              ? 'Stop'
              : 'Stop listening'
            : 'Start listening'}
        </button>
        {voice.intakePhase === 'opening' ? (
          <button
            type="button"
            onClick={voice.skipOpening}
            className="ebc-action-secondary min-h-11 w-full sm:w-auto"
          >
            Skip intro
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => voice.speakGuidance()}
          className="ebc-action-secondary min-h-11 w-full sm:w-auto"
        >
          {voice.isSpeaking ? 'Speaking…' : 'Repeat'}
        </button>
        <button
          type="button"
          onClick={voice.restartIntake}
          className="ebc-action-secondary min-h-11 w-full sm:w-auto"
        >
          Start over
        </button>
        {voice.isSpeaking ? (
          <button
            type="button"
            onClick={voice.stopSpeaking}
            className="ebc-action-secondary min-h-11 w-full sm:w-auto"
          >
            Quiet
          </button>
        ) : null}
      </div>

      {!embedded ? (
        <p className="text-sm text-slate-600">
          Skip the intro anytime and just describe the event. Say “skip” if you
          are not sure about a follow-up.
        </p>
      ) : null}

      {!embedded && voice.lastHeard ? (
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          Heard: “{voice.lastHeard}”
        </p>
      ) : null}

      {!embedded && voice.lastReply ? (
        <p className="rounded-lg border border-ebc-burgundy/20 bg-white px-3 py-2 text-sm text-slate-700">
          Coach: {voice.lastReply}
        </p>
      ) : null}

      {voice.error ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {voice.error}
        </p>
      ) : null}

      {!voice.isSupported ? (
        <p className="text-sm text-slate-500">
          Voice works best in Chrome or Edge on a phone or computer with a
          microphone.
        </p>
      ) : null}
    </div>
  );

  if (embedded) {
    return (
      <section aria-label="Voice coach controls" className="space-y-3">
        {controls}
      </section>
    );
  }

  return (
    <section
      aria-label="Voice coach"
      className="rounded-xl border border-ebc-burgundy/20 bg-ebc-burgundy/[0.03] px-4 py-4"
    >
      {controls}
    </section>
  );
}
