import type {
  ParsedVoiceTranscript,
  SpeechRecognitionInstance,
  VoiceCommand,
} from './cursor-voice-input.types';

const COMMAND_ALIASES: Record<VoiceCommand, string[]> = {
  submit: ['submit', 'ask', 'go', 'send', 'run'],
  clear: ['clear', 'reset', 'erase'],
  new: ['new conversation', 'new chat', 'new'],
  stop: ['stop listening', 'stop', 'cancel', 'never mind'],
};

const COMMAND_ORDER: VoiceCommand[] = ['new', 'stop', 'clear', 'submit'];

export function normalizeTranscript(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function parseVoiceCommand(transcript: string): ParsedVoiceTranscript {
  const normalized = normalizeTranscript(transcript);
  if (!normalized) return { text: '' };

  const lower = normalized.toLowerCase();

  for (const command of COMMAND_ORDER) {
    for (const phrase of COMMAND_ALIASES[command]) {
      if (lower === phrase) {
        return { text: '', command };
      }

      const suffix = ` ${phrase}`;
      if (lower.endsWith(suffix)) {
        const text = normalized.slice(0, normalized.length - suffix.length).trim();
        return { text, command };
      }
    }
  }

  return { text: normalized };
}

export function mergeVoicePrompt(base: string, spoken: string): string {
  const prefix = normalizeTranscript(base);
  const addition = normalizeTranscript(spoken);
  if (!prefix) return addition;
  if (!addition) return prefix;
  return `${prefix} ${addition}`;
}

export function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === 'undefined') return undefined;

  const globalWindow = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };

  return globalWindow.SpeechRecognition ?? globalWindow.webkitSpeechRecognition;
}

export function voiceStatusMessage(status: string, error?: string | null): string | null {
  if (status === 'unsupported') {
    return 'Voice input is not supported in this browser. Try Chrome or Edge.';
  }
  if (status === 'denied') {
    return 'Microphone access was denied. Allow the mic in your browser settings.';
  }
  if (status === 'error' && error) {
    return error;
  }
  return null;
}
