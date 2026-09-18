import { describe, expect, it } from 'vitest';

import {
  MEETING_SEGMENTS,
  SCROLL_SPEED_MAX,
  SCROLL_SPEED_MIN,
  SPEECH_CUES,
  TIMING_PRESETS,
} from './club-climate-cue.constants';
import {
  clampCueIndex,
  clampScrollSpeed,
  findTimingPreset,
  formatSpeechTime,
  getCueProgressPercent,
  getMeetingSegmentAt,
  getScrollProgressPercent,
  getSpeechCueAt,
  getTimingLight,
  isPresetOvertime,
  isSpeechOvertime,
  splitEmphasis,
} from './club-climate-cue.utils';

describe('formatSpeechTime', () => {
  it('pads minutes and seconds', () => {
    expect(formatSpeechTime(0)).toBe('00:00');
    expect(formatSpeechTime(61)).toBe('01:01');
    expect(formatSpeechTime(15 * 60)).toBe('15:00');
  });

  it('does not go below zero', () => {
    expect(formatSpeechTime(-12)).toBe('00:00');
  });
});

describe('getTimingLight', () => {
  const preset = {
    greenSeconds: 10 * 60,
    yellowSeconds: 13 * 60,
    redSeconds: 15 * 60,
    lights: true,
  };

  it('stays off until green', () => {
    expect(getTimingLight(0, preset)).toBe('off');
    expect(getTimingLight(599, preset)).toBe('off');
  });

  it('turns green, then yellow, then red at the Toastmasters marks', () => {
    expect(getTimingLight(600, preset)).toBe('green');
    expect(getTimingLight(779, preset)).toBe('green');
    expect(getTimingLight(780, preset)).toBe('yellow');
    expect(getTimingLight(900, preset)).toBe('red');
    expect(getTimingLight(901, preset)).toBe('red');
  });

  it('stays off when the segment has no lights', () => {
    expect(
      getTimingLight(500, {
        greenSeconds: 0,
        yellowSeconds: 0,
        redSeconds: 0,
        lights: false,
      }),
    ).toBe('off');
  });
});

describe('isSpeechOvertime', () => {
  it('is overtime only after the red mark', () => {
    expect(isSpeechOvertime(15 * 60, 15 * 60)).toBe(false);
    expect(isSpeechOvertime(15 * 60 + 1, 15 * 60)).toBe(true);
  });
});

describe('clampCueIndex', () => {
  it('keeps the reader on a real card', () => {
    expect(clampCueIndex(-1, 10)).toBe(0);
    expect(clampCueIndex(3, 10)).toBe(3);
    expect(clampCueIndex(99, 10)).toBe(9);
    expect(clampCueIndex(0, 0)).toBe(0);
  });
});

describe('getCueProgressPercent', () => {
  it('counts the current card as completed progress', () => {
    expect(getCueProgressPercent(0, 10)).toBe(10);
    expect(getCueProgressPercent(9, 10)).toBe(100);
    expect(getCueProgressPercent(0, 0)).toBe(0);
  });
});

describe('findTimingPreset', () => {
  it('returns the matching preset and falls back to the first', () => {
    expect(findTimingPreset(TIMING_PRESETS, '8-10').label).toBe('8–10 min');
    expect(findTimingPreset(TIMING_PRESETS, '5-7').greenSeconds).toBe(5 * 60);
  });
});

describe('splitEmphasis', () => {
  it('keeps plain text as a single segment', () => {
    expect(splitEmphasis('hello')).toEqual([{ type: 'text', text: 'hello' }]);
  });

  it('marks **words** as strong', () => {
    expect(splitEmphasis('people **THRIVE** here')).toEqual([
      { type: 'text', text: 'people ' },
      { type: 'strong', text: 'THRIVE' },
      { type: 'text', text: ' here' },
    ]);
  });
});

describe('getSpeechCueAt', () => {
  it('returns the cue at a clamped index', () => {
    const last = SPEECH_CUES[SPEECH_CUES.length - 1];
    expect(getSpeechCueAt(SPEECH_CUES, 0).id).toBe('title');
    expect(last).toBeDefined();
    expect(getSpeechCueAt(SPEECH_CUES, 99).id).toBe(last?.id);
  });

  it('throws when the deck is empty', () => {
    expect(() => getSpeechCueAt([], 0)).toThrow('Speech cue is missing');
  });
});

describe('SPEECH_CUES', () => {
  it('has unique ids and at least one line per card', () => {
    const ids = SPEECH_CUES.map((cue) => cue.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SPEECH_CUES.length).toBeGreaterThan(10);
    for (const cue of SPEECH_CUES) {
      expect(cue.lines.length).toBeGreaterThan(0);
      expect(cue.slide).toBeGreaterThanOrEqual(1);
      expect(cue.slide).toBeLessThanOrEqual(6);
    }
  });
});

describe('clampScrollSpeed', () => {
  it('stays inside the teleprompter range', () => {
    expect(clampScrollSpeed(0)).toBe(SCROLL_SPEED_MIN);
    expect(clampScrollSpeed(999)).toBe(SCROLL_SPEED_MAX);
    expect(clampScrollSpeed(24)).toBe(24);
  });
});

describe('getScrollProgressPercent', () => {
  it('is 100 when there is nothing to scroll', () => {
    expect(getScrollProgressPercent(0, 400, 400)).toBe(100);
  });

  it('tracks how far the script has moved', () => {
    expect(getScrollProgressPercent(0, 1000, 200)).toBe(0);
    expect(getScrollProgressPercent(400, 1000, 200)).toBe(50);
    expect(getScrollProgressPercent(800, 1000, 200)).toBe(100);
  });
});

describe('isPresetOvertime', () => {
  it('never flags overtime when lights are off', () => {
    expect(isPresetOvertime(90, { redSeconds: 0, lights: false })).toBe(false);
  });
});

describe('getMeetingSegmentAt', () => {
  it('returns the first and last meeting parts', () => {
    expect(getMeetingSegmentAt(MEETING_SEGMENTS, 0).id).toBe('welcome');
    expect(getMeetingSegmentAt(MEETING_SEGMENTS, 99).id).toBe('adjourn');
  });
});

describe('MEETING_SEGMENTS', () => {
  it('has unique ids, scripts, and timing for each part', () => {
    const ids = MEETING_SEGMENTS.map((segment) => segment.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(MEETING_SEGMENTS.length).toBeGreaterThanOrEqual(3);
    for (const segment of MEETING_SEGMENTS) {
      expect(segment.cues.length).toBeGreaterThan(0);
      expect(segment.label.length).toBeGreaterThan(0);
    }
  });
});
