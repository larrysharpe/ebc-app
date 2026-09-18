'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import {
  DEFAULT_FONT_SCALE,
  DEFAULT_SCROLL_SPEED,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  MEETING_SEGMENTS,
  SCROLL_SPEED_STEP,
  TIMING_PRESETS,
} from './club-climate-cue.constants';
import type { MeetingSegment, TimingPresetId } from './club-climate-cue.types';
import {
  clampCueIndex,
  clampScrollSpeed,
  findTimingPreset,
  formatSpeechTime,
  getMeetingSegmentAt,
  getScrollProgressPercent,
  getTimingLight,
  isPresetOvertime,
} from './club-climate-cue.utils';

export type UseClubClimateCueResult = {
  scrollerRef: RefObject<HTMLDivElement | null>;
  segment: MeetingSegment;
  segmentIndex: number;
  segmentCount: number;
  goToSegment: (index: number) => void;
  goToPrevSegment: () => void;
  goToNextSegment: () => void;
  elapsedSeconds: number;
  formattedTime: string;
  timerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  presetId: TimingPresetId;
  setPresetId: (id: TimingPresetId) => void;
  light: ReturnType<typeof getTimingLight>;
  isOvertime: boolean;
  fontScale: number;
  bumpFont: (direction: 1 | -1) => void;
  scrolling: boolean;
  toggleScroll: () => void;
  scrollSpeed: number;
  bumpSpeed: (direction: 1 | -1) => void;
  progressPercent: number;
  restart: () => void;
};

export function useClubClimateCue(): UseClubClimateCueResult {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [presetId, setPresetId] = useState<TimingPresetId>(
    MEETING_SEGMENTS[0]?.timingPresetId ?? 'off',
  );
  const [fontScale, setFontScale] = useState(DEFAULT_FONT_SCALE);
  const [scrolling, setScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(DEFAULT_SCROLL_SPEED);
  const [progressPercent, setProgressPercent] = useState(0);
  const elapsedRef = useRef(0);
  const speedRef = useRef(DEFAULT_SCROLL_SPEED);
  const startedTimerRef = useRef(false);

  elapsedRef.current = elapsedSeconds;
  speedRef.current = scrollSpeed;

  const segmentCount = MEETING_SEGMENTS.length;
  const safeIndex = clampCueIndex(segmentIndex, segmentCount);
  const segment = getMeetingSegmentAt(MEETING_SEGMENTS, safeIndex);
  const preset = findTimingPreset(TIMING_PRESETS, presetId);

  const resetPlayhead = useCallback((): void => {
    setScrolling(false);
    setTimerRunning(false);
    setElapsedSeconds(0);
    startedTimerRef.current = false;
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = 0;
    setProgressPercent(0);
  }, []);

  const goToSegment = useCallback(
    (index: number): void => {
      const nextIndex = clampCueIndex(index, segmentCount);
      const nextSegment = getMeetingSegmentAt(MEETING_SEGMENTS, nextIndex);
      setSegmentIndex(nextIndex);
      setPresetId(nextSegment.timingPresetId);
      resetPlayhead();
    },
    [resetPlayhead, segmentCount],
  );

  const goToPrevSegment = useCallback(() => {
    goToSegment(safeIndex - 1);
  }, [goToSegment, safeIndex]);

  const goToNextSegment = useCallback(() => {
    goToSegment(safeIndex + 1);
  }, [goToSegment, safeIndex]);

  const toggleTimer = useCallback(() => {
    setTimerRunning((current) => !current);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setElapsedSeconds(0);
    startedTimerRef.current = false;
  }, []);

  const bumpFont = useCallback((direction: 1 | -1) => {
    setFontScale((current) => {
      const next = current + direction * FONT_SCALE_STEP;
      return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Number(next.toFixed(2))));
    });
  }, []);

  const bumpSpeed = useCallback((direction: 1 | -1) => {
    setScrollSpeed((current) => clampScrollSpeed(current + direction * SCROLL_SPEED_STEP));
  }, []);

  const toggleScroll = useCallback(() => {
    setScrolling((current) => {
      const next = !current;
      if (next && !startedTimerRef.current && elapsedRef.current === 0) {
        startedTimerRef.current = true;
        setTimerRunning(true);
      }
      return next;
    });
  }, []);

  const restart = useCallback(() => {
    resetPlayhead();
  }, [resetPlayhead]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const origin = Date.now() - elapsedRef.current * 1000;
    const timerId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - origin) / 1000));
    }, 200);
    return () => window.clearInterval(timerId);
  }, [timerRunning]);

  useEffect(() => {
    if (!scrolling) return undefined;
    let frame = 0;
    let last = performance.now();

    function tick(now: number): void {
      const elapsed = (now - last) / 1000;
      last = now;
      const scroller = scrollerRef.current;
      if (scroller) {
        scroller.scrollTop += speedRef.current * elapsed;
        const atEnd =
          scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
        setProgressPercent(
          getScrollProgressPercent(
            scroller.scrollTop,
            scroller.scrollHeight,
            scroller.clientHeight,
          ),
        );
        if (atEnd) {
          setScrolling(false);
          return;
        }
      }
      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [scrolling]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    function onScroll(): void {
      const el = scrollerRef.current;
      if (!el) return;
      setProgressPercent(
        getScrollProgressPercent(el.scrollTop, el.scrollHeight, el.clientHeight),
      );
    }

    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'BUTTON' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === ']' || event.key === 'PageDown') {
        event.preventDefault();
        goToNextSegment();
        return;
      }
      if (event.key === '[' || event.key === 'PageUp') {
        event.preventDefault();
        goToPrevSegment();
        return;
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        toggleScroll();
        return;
      }
      if (event.key === 'ArrowRight' || event.key === '=' || event.key === '+') {
        event.preventDefault();
        bumpSpeed(1);
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === '-' || event.key === '_') {
        event.preventDefault();
        bumpSpeed(-1);
        return;
      }
      if (event.key === 's' || event.key === 'S' || event.key === 't' || event.key === 'T') {
        event.preventDefault();
        toggleTimer();
        return;
      }
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        restart();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bumpSpeed, goToNextSegment, goToPrevSegment, restart, toggleScroll, toggleTimer]);

  return {
    scrollerRef,
    segment,
    segmentIndex: safeIndex,
    segmentCount,
    goToSegment,
    goToPrevSegment,
    goToNextSegment,
    elapsedSeconds,
    formattedTime: formatSpeechTime(elapsedSeconds),
    timerRunning,
    toggleTimer,
    resetTimer,
    presetId,
    setPresetId,
    light: getTimingLight(elapsedSeconds, preset),
    isOvertime: isPresetOvertime(elapsedSeconds, preset),
    fontScale,
    bumpFont,
    scrolling,
    toggleScroll,
    scrollSpeed,
    bumpSpeed,
    progressPercent,
    restart,
  };
}
