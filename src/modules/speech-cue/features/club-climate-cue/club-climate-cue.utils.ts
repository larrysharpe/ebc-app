import {
  SCROLL_SPEED_MAX,
  SCROLL_SPEED_MIN,
} from './club-climate-cue.constants';
import type {
  EmphasisSegment,
  MeetingSegment,
  SpeechCue,
  TimingLight,
  TimingPreset,
  TimingPresetId,
} from './club-climate-cue.types';

export function formatSpeechTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getTimingLight(
  elapsedSeconds: number,
  preset: Pick<TimingPreset, 'greenSeconds' | 'yellowSeconds' | 'redSeconds' | 'lights'>,
): TimingLight {
  if (preset.lights === false) return 'off';
  if (elapsedSeconds >= preset.redSeconds) return 'red';
  if (elapsedSeconds >= preset.yellowSeconds) return 'yellow';
  if (elapsedSeconds >= preset.greenSeconds) return 'green';
  return 'off';
}

export function isSpeechOvertime(
  elapsedSeconds: number,
  redSeconds: number,
): boolean {
  return elapsedSeconds > redSeconds;
}

export function isPresetOvertime(
  elapsedSeconds: number,
  preset: Pick<TimingPreset, 'redSeconds' | 'lights'>,
): boolean {
  if (preset.lights === false) return false;
  return isSpeechOvertime(elapsedSeconds, preset.redSeconds);
}

export function clampCueIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(Math.max(0, index), length - 1);
}

export function getCueProgressPercent(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.round(((clampCueIndex(index, length) + 1) / length) * 100);
}

export function findTimingPreset(
  presets: readonly TimingPreset[],
  id: TimingPresetId,
): TimingPreset {
  const match = presets.find((preset) => preset.id === id);
  if (match) return match;
  const first = presets[0];
  if (first) return first;
  throw new Error('No timing presets configured');
}

export function splitEmphasis(text: string): EmphasisSegment[] {
  const segments: EmphasisSegment[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match = regex.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'strong', text: match[1] ?? '' });
    lastIndex = match.index + match[0].length;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return segments.filter((segment) => segment.text.length > 0);
}

export function getSpeechCueAt(
  cues: readonly SpeechCue[],
  index: number,
): SpeechCue {
  const cue = cues[clampCueIndex(index, cues.length)];
  if (cue) return cue;
  throw new Error('Speech cue is missing');
}

export function getMeetingSegmentAt(
  segments: readonly MeetingSegment[],
  index: number,
): MeetingSegment {
  const segment = segments[clampCueIndex(index, segments.length)];
  if (segment) return segment;
  throw new Error('Meeting segment is missing');
}

export function clampScrollSpeed(pxPerSecond: number): number {
  return Math.min(SCROLL_SPEED_MAX, Math.max(SCROLL_SPEED_MIN, pxPerSecond));
}

export function getScrollProgressPercent(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
): number {
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) return 100;
  return Math.round((Math.min(Math.max(0, scrollTop), maxScroll) / maxScroll) * 100);
}
