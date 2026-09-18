'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { EventFormStepId } from '../../church-event-form.constants';
import type {
  SpeechRecognitionInstance,
  VoiceCoachStatus,
} from './event-form-voice.types';
import {
  fetchEventFormTtsBlob,
  playHtmlAudioBlob,
  stopHtmlAudio,
  unlockHtmlAudio,
} from './event-form-voice-audio.utils';
import {
  createIntakeSession,
  getIntakeOpeningPrompt,
  getIntakeSkipOpeningPrompt,
  processIntakeTurn,
  questionForSlot,
  type EventFormIntakePatch,
  type IntakeSession,
} from './event-form-voice-intake.utils';
import {
  buildStepGuidance,
  describeVoiceCommand,
  getSpeechRecognitionConstructor,
  isSpeechSynthesisSupported,
  parseEventFormVoiceCommand,
  pickNaturalSpeechVoice,
  type EventFormVoiceCommand,
} from './event-form-voice.utils';

export type UseEventFormVoiceOptions = {
  step: EventFormStepId;
  enabled: boolean;
  /** Intake fills the form from conversation. */
  onIntakePatch: (patch: EventFormIntakePatch) => void;
  /** Escape-hatch commands after intake is ready (continue, save, etc.). */
  onCommand: (command: EventFormVoiceCommand) => string | void;
};

export type UseEventFormVoiceResult = {
  status: VoiceCoachStatus;
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  lastHeard: string | null;
  lastReply: string | null;
  intakePhase: IntakeSession['phase'];
  error: string | null;
  speakGuidance: (override?: string) => void;
  stopSpeaking: () => void;
  startListening: () => void;
  toggleListening: () => void;
  stopListening: () => void;
  skipOpening: () => void;
  restartIntake: () => void;
};

function normalizeSpoken(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeEcho(heard: string, spoken: string): boolean {
  const a = normalizeSpoken(heard);
  const b = normalizeSpoken(spoken);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 24 && b.includes(a)) return true;
  if (b.length >= 24 && a.includes(b.slice(0, Math.min(80, b.length)))) {
    return true;
  }
  return false;
}

async function speakWithBrowserFallback(
  text: string,
  signal: AbortSignal,
  voice: SpeechSynthesisVoice | null,
): Promise<void> {
  if (!isSpeechSynthesisSupported()) {
    throw new Error('Speech is not supported in this browser.');
  }
  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  await new Promise<void>((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.lang = voice?.lang || 'en-US';
    if (voice) utterance.voice = voice;

    const onAbort = (): void => {
      window.speechSynthesis.cancel();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });

    utterance.onend = () => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    };
    utterance.onerror = () => {
      signal.removeEventListener('abort', onAbort);
      reject(new Error('Browser speech failed.'));
    };
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.resume();
  });
}

export function useEventFormVoice({
  step,
  enabled,
  onIntakePatch,
  onCommand,
}: UseEventFormVoiceOptions): UseEventFormVoiceResult {
  const [status, setStatus] = useState<VoiceCoachStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [intake, setIntake] = useState<IntakeSession>(() => createIntakeSession());
  const [sessionActive, setSessionActive] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const wantMicRef = useRef(false);
  const speakingRef = useRef(false);
  const speakAbortRef = useRef<AbortController | null>(null);
  const speakGenerationRef = useRef(0);
  const onCommandRef = useRef(onCommand);
  const onIntakePatchRef = useRef(onIntakePatch);
  const stepRef = useRef(step);
  const lastGuidanceRef = useRef('');
  const intakeRef = useRef(intake);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const ttsCacheRef = useRef<Map<string, Blob>>(new Map());
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      Boolean(getSpeechRecognitionConstructor()) ||
        isSpeechSynthesisSupported(),
    );
  }, []);

  useEffect(() => {
    if (!isSpeechSynthesisSupported()) return;
    const loadVoices = (): void => {
      preferredVoiceRef.current =
        (pickNaturalSpeechVoice(
          window.speechSynthesis.getVoices(),
        ) as SpeechSynthesisVoice | null) ?? null;
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    onIntakePatchRef.current = onIntakePatch;
  }, [onIntakePatch]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    intakeRef.current = intake;
  }, [intake]);

  const resumeRecognitionIfWanted = useCallback(() => {
    if (!wantMicRef.current || speakingRef.current) return;
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.start();
      setStatus('listening');
    } catch {
      setStatus((current) => (current === 'speaking' ? 'listening' : current));
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    speakGenerationRef.current += 1;
    speakAbortRef.current?.abort();
    speakAbortRef.current = null;
    speakingRef.current = false;
    stopHtmlAudio();
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
    setIsSpeaking(false);
    setStatus((current) => (current === 'speaking' ? 'idle' : current));
  }, []);

  const speakGuidance = useCallback(
    (override?: string) => {
      const text = (
        override ??
        (intakeRef.current.phase === 'ready'
          ? buildStepGuidance(stepRef.current)
          : getIntakeOpeningPrompt())
      ).trim();
      if (!text) return;

      speakAbortRef.current?.abort();
      const abort = new AbortController();
      speakAbortRef.current = abort;
      const generation = speakGenerationRef.current + 1;
      speakGenerationRef.current = generation;

      speakingRef.current = true;
      setIsSpeaking(true);
      setStatus('speaking');
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore.
      }

      lastGuidanceRef.current = text;
      setLastReply(text);

      void (async () => {
        try {
          let blob = ttsCacheRef.current.get(text);
          if (!blob) {
            blob = await fetchEventFormTtsBlob(text, abort.signal);
            if (ttsCacheRef.current.size > 30) {
              ttsCacheRef.current.clear();
            }
            ttsCacheRef.current.set(text, blob);
          }
          if (speakGenerationRef.current !== generation) return;
          await playHtmlAudioBlob(blob, abort.signal);
        } catch (error) {
          if (abort.signal.aborted || speakGenerationRef.current !== generation) {
            return;
          }
          // Fall back to browser voices if OpenAI TTS is unavailable.
          try {
            await speakWithBrowserFallback(
              text,
              abort.signal,
              preferredVoiceRef.current,
            );
          } catch {
            if (!abort.signal.aborted) {
              setError(
                error instanceof Error
                  ? 'Could not play the coach voice. Check your connection, or tap Repeat.'
                  : 'Could not play the coach voice.',
              );
            }
          }
        } finally {
          if (speakGenerationRef.current !== generation) return;
          speakingRef.current = false;
          setIsSpeaking(false);
          if (wantMicRef.current) {
            resumeRecognitionIfWanted();
          } else {
            setStatus('idle');
          }
        }
      })();
    },
    [resumeRecognitionIfWanted],
  );

  const stopListening = useCallback(() => {
    wantMicRef.current = false;
    setSessionActive(false);
    stopSpeaking();
    try {
      recognitionRef.current?.abort();
    } catch {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore.
      }
    }
    recognitionRef.current = null;
    setStatus('idle');
  }, [stopSpeaking]);

  const restartIntake = useCallback(() => {
    const fresh = createIntakeSession();
    intakeRef.current = fresh;
    setIntake(fresh);
    speakGuidance(getIntakeOpeningPrompt());
  }, [speakGuidance]);

  const skipOpening = useCallback(() => {
    speakGuidance(getIntakeSkipOpeningPrompt());
  }, [speakGuidance]);

  const handleFinalTranscript = useCallback(
    (spoken: string) => {
      if (!wantMicRef.current || speakingRef.current) return;

      const trimmed = spoken.trim();
      if (!trimmed) return;
      if (looksLikeEcho(trimmed, lastGuidanceRef.current)) return;

      setLastHeard(trimmed);
      const softText = normalizeSpoken(trimmed);

      if (
        intakeRef.current.phase === 'opening' &&
        (softText === 'skip' ||
          softText.includes('skip intro') ||
          softText.includes('skip the intro') ||
          softText.includes('skip opening') ||
          softText.includes('just start') ||
          softText.includes('i am ready') ||
          softText.includes('im ready'))
      ) {
        speakGuidance(getIntakeSkipOpeningPrompt());
        return;
      }

      const command = parseEventFormVoiceCommand(trimmed);
      const intakeDone = intakeRef.current.phase === 'ready';

      const isPostIntakeCommand =
        intakeDone &&
        (command.type === 'next' ||
          command.type === 'back' ||
          command.type === 'goToStep' ||
          command.type === 'runReview' ||
          command.type === 'saveDraft' ||
          command.type === 'submitApproval' ||
          command.type === 'suggestTime' ||
          command.type === 'useSuggestion' ||
          command.type === 'setTimePreference' ||
          command.type === 'ackAll' ||
          command.type === 'help' ||
          command.type === 'repeat' ||
          command.type === 'stop');

      if (isPostIntakeCommand || command.type === 'stop') {
        const customReply = onCommandRef.current(command);
        if (command.type === 'stop') {
          stopListening();
          return;
        }
        if (command.type === 'help') {
          speakGuidance(
            customReply ??
              (intakeDone
                ? buildStepGuidance(stepRef.current)
                : getIntakeOpeningPrompt()),
          );
          return;
        }
        if (command.type === 'repeat') {
          speakGuidance(
            customReply ??
              (lastGuidanceRef.current || getIntakeOpeningPrompt()),
          );
          return;
        }
        speakGuidance(customReply ?? describeVoiceCommand(command));
        return;
      }

      const turn = processIntakeTurn(intakeRef.current, trimmed);
      intakeRef.current = turn.session;
      setIntake(turn.session);

      if (Object.keys(turn.patch).length > 0) {
        onIntakePatchRef.current(turn.patch);
      }

      if (turn.exitIntake) {
        stopListening();
        onCommandRef.current({ type: 'stop' });
        return;
      }

      speakGuidance(turn.reply);
    },
    [speakGuidance, stopListening],
  );

  const bindRecognition = useCallback(
    (recognition: SpeechRecognitionInstance): void => {
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        if (!wantMicRef.current || speakingRef.current) return;
        let final = '';
        for (
          let index = event.resultIndex;
          index < event.results.length;
          index += 1
        ) {
          const result = event.results[index];
          if (result?.isFinal) {
            final += result[0]?.transcript ?? '';
          }
        }
        if (final.trim()) handleFinalTranscript(final);
      };

      recognition.onerror = (event) => {
        if (event.error === 'aborted' || event.error === 'no-speech') return;
        if (!wantMicRef.current) return;
        if (
          event.error === 'not-allowed' ||
          event.error === 'service-not-allowed'
        ) {
          wantMicRef.current = false;
          setSessionActive(false);
          setStatus('denied');
          setError(
            'Microphone access was denied. Allow the mic in your browser.',
          );
          return;
        }
        setStatus('error');
        setError('Voice listening failed. Tap Start listening and try again.');
      };

      recognition.onend = () => {
        if (!wantMicRef.current || speakingRef.current) return;
        try {
          recognition.start();
          setStatus('listening');
        } catch {
          wantMicRef.current = false;
          setSessionActive(false);
          setStatus('idle');
        }
      };
    },
    [handleFinalTranscript],
  );

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!enabled) return;

    unlockHtmlAudio();
    setError(null);

    if (!SpeechRecognitionCtor) {
      setStatus('unsupported');
      setError('Voice listening works best in Chrome or Edge.');
      if (intakeRef.current.phase === 'opening') {
        speakGuidance(getIntakeOpeningPrompt());
      }
      return;
    }

    try {
      recognitionRef.current?.abort();
    } catch {
      // Ignore.
    }

    const recognition = new SpeechRecognitionCtor();
    bindRecognition(recognition);
    recognitionRef.current = recognition;
    wantMicRef.current = true;
    setSessionActive(true);

    const opening = intakeRef.current.phase === 'opening';
    const clarifying =
      intakeRef.current.phase === 'clarifying' &&
      intakeRef.current.pendingSlot
        ? questionForSlot(intakeRef.current.pendingSlot)
        : null;

    if (opening) {
      setStatus('speaking');
      speakGuidance(getIntakeOpeningPrompt());
      return;
    }

    if (clarifying) {
      setStatus('speaking');
      speakGuidance(clarifying);
      return;
    }

    try {
      recognition.start();
      setStatus('listening');
    } catch {
      wantMicRef.current = false;
      setSessionActive(false);
      setStatus('error');
      setError('Could not start the microphone.');
    }
  }, [bindRecognition, enabled, speakGuidance]);

  const toggleListening = useCallback(() => {
    if (wantMicRef.current || sessionActive || speakingRef.current) {
      stopListening();
      return;
    }
    if (!getSpeechRecognitionConstructor()) {
      setStatus('unsupported');
      setError('Voice listening works best in Chrome or Edge.');
      speakGuidance();
      return;
    }
    startListening();
  }, [sessionActive, speakGuidance, startListening, stopListening]);

  useEffect(() => {
    if (!enabled) {
      stopListening();
      const fresh = createIntakeSession();
      intakeRef.current = fresh;
      setIntake(fresh);
      setLastReply(null);
      lastGuidanceRef.current = '';
      ttsCacheRef.current.clear();
    }
  }, [enabled, stopListening]);

  useEffect(() => {
    if (!enabled || !wantMicRef.current) return;
    if (intakeRef.current.phase !== 'ready') return;
    speakGuidance(buildStepGuidance(step));
  }, [enabled, speakGuidance, step]);

  useEffect(() => {
    return () => {
      wantMicRef.current = false;
      speakAbortRef.current?.abort();
      stopHtmlAudio();
      try {
        recognitionRef.current?.abort();
      } catch {
        // Ignore.
      }
      recognitionRef.current = null;
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  return {
    status,
    isListening: sessionActive,
    isSpeaking,
    isSupported,
    lastHeard,
    lastReply,
    intakePhase: intake.phase,
    error,
    speakGuidance,
    stopSpeaking,
    startListening,
    toggleListening,
    stopListening,
    skipOpening,
    restartIntake,
  };
}
