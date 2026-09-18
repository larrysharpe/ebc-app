export type CueLineType = 'body' | 'strong' | 'quote' | 'stage' | 'bullet';

export type CueLine = {
  type: CueLineType;
  text: string;
};

export type SpeechCue = {
  id: string;
  slide: number;
  section: string;
  lines: CueLine[];
};

export type TimingPresetId = 'off' | '1-2' | '2-3' | '5-7' | '8-10' | '10-15';

export type TimingPreset = {
  id: TimingPresetId;
  label: string;
  greenSeconds: number;
  yellowSeconds: number;
  redSeconds: number;
  lights: boolean;
};

export type MeetingSegment = {
  id: string;
  label: string;
  title: string;
  timingPresetId: TimingPresetId;
  cues: SpeechCue[];
};

export type TimingLight = 'off' | 'green' | 'yellow' | 'red';

export type EmphasisSegment =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string };
