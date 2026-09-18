import type { SpeechCue } from '../../club-climate-cue.types';

export type SpeechScriptProps = {
  cues: readonly SpeechCue[];
  fontScale: number;
};
