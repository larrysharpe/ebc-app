'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  SpeechRecognitionInstance,
  VoiceCommand,
  VoiceInputStatus,
} from './cursor-voice-input.types';
import {
  getSpeechRecognitionConstructor,
  mergeVoicePrompt,
  parseVoiceCommand,
} from './cursor-voice-input.utils';

export type UseCursorVoiceInputOptions = {
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (promptOverride?: string) => void;
  onClearPrompt?: () => void;
  onNewConversation?: () => void;
  disabled?: boolean;
};

export type UseCursorVoiceInputResult = {
  status: VoiceInputStatus;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  toggleListening: () => void;
  stopListening: () => void;
};

export function useCursorVoiceInput({
  prompt,
  setPrompt,
  onSubmit,
  onClearPrompt,
  onNewConversation,
  disabled = false,
}: UseCursorVoiceInputOptions): UseCursorVoiceInputResult {
  const [status, setStatus] = useState<VoiceInputStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const listeningRef = useRef(false);
  const basePromptRef = useRef('');
  const finalSpokenRef = useRef('');
  const promptRef = useRef(prompt);
  /** Start false on server + first client paint to avoid hydration mismatch. */
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognitionConstructor()));
  }, []);

  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setStatus('idle');
    recognitionRef.current?.stop();
  }, []);

  const applyTranscript = useCallback(
    (spoken: string, isFinal: boolean) => {
      const parsed = parseVoiceCommand(spoken);

      if (isFinal) {
        finalSpokenRef.current = mergeVoicePrompt(finalSpokenRef.current, parsed.text);
      }

      const liveSpoken = isFinal
        ? finalSpokenRef.current
        : mergeVoicePrompt(finalSpokenRef.current, parsed.text);

      setPrompt(mergeVoicePrompt(basePromptRef.current, liveSpoken));

      if (isFinal && parsed.command) {
        const nextPrompt =
          parsed.command === 'clear'
            ? ''
            : mergeVoicePrompt(basePromptRef.current, finalSpokenRef.current);

        if (parsed.command === 'clear') {
          basePromptRef.current = '';
          finalSpokenRef.current = '';
        }

        setPrompt(nextPrompt);
        executeVoiceCommand(parsed.command, {
          prompt: nextPrompt,
          setPrompt,
          onSubmit,
          onClearPrompt,
          onNewConversation,
          stopListening,
        });
      }
    },
    [onClearPrompt, onNewConversation, onSubmit, setPrompt, stopListening],
  );

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor || disabled) return;

    setError(null);
    basePromptRef.current = promptRef.current;
    finalSpokenRef.current = '';

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? '';
        if (result?.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) applyTranscript(final, true);
      if (interim) applyTranscript(interim, false);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;

      listeningRef.current = false;

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setStatus('denied');
        setError('Microphone access was denied.');
        return;
      }

      setStatus('error');
      setError('Voice input failed. Try again.');
    };

    recognition.onend = () => {
      if (!listeningRef.current) {
        setStatus('idle');
        return;
      }

      try {
        recognition.start();
      } catch {
        listeningRef.current = false;
        setStatus('idle');
      }
    };

    recognitionRef.current = recognition;
    listeningRef.current = true;
    setStatus('listening');

    try {
      recognition.start();
    } catch {
      listeningRef.current = false;
      setStatus('error');
      setError('Could not start voice input.');
    }
  }, [applyTranscript, disabled]);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }

    if (listeningRef.current) {
      stopListening();
      return;
    }

    startListening();
  }, [isSupported, startListening, stopListening]);

  useEffect(() => {
    if (disabled && listeningRef.current) {
      stopListening();
    }
  }, [disabled, stopListening]);

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  return {
    status,
    isListening: status === 'listening',
    isSupported,
    error,
    toggleListening,
    stopListening,
  };
}

function executeVoiceCommand(
  command: VoiceCommand,
  handlers: {
    prompt: string;
    setPrompt: (value: string) => void;
    onSubmit: (promptOverride?: string) => void;
    onClearPrompt?: () => void;
    onNewConversation?: () => void;
    stopListening: () => void;
  },
): void {
  switch (command) {
    case 'submit':
      handlers.stopListening();
      handlers.onSubmit(handlers.prompt);
      break;
    case 'clear':
      handlers.setPrompt('');
      handlers.onClearPrompt?.();
      break;
    case 'new':
      handlers.stopListening();
      handlers.onNewConversation?.();
      break;
    case 'stop':
      handlers.stopListening();
      break;
    default:
      break;
  }
}
