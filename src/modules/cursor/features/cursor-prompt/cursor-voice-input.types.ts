export type VoiceInputStatus = 'idle' | 'listening' | 'unsupported' | 'denied' | 'error';

export type VoiceCommand = 'submit' | 'clear' | 'new' | 'stop';

export type ParsedVoiceTranscript = {
  text: string;
  command?: VoiceCommand;
};

/** Minimal Web Speech API surface used by the voice input hook. */
export type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

export type SpeechRecognitionResultList = {
  length: number;
  [index: number]: SpeechRecognitionResult;
};

export type SpeechRecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
};

export type SpeechRecognitionAlternative = {
  transcript: string;
};

export type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};
