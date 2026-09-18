'use client';

import type { ReactElement } from 'react';

import { MEETING_SEGMENTS, TIMING_PRESETS } from './club-climate-cue.constants';
import { SegmentQueue } from './components/SegmentQueue';
import { SpeechScript } from './components/SpeechScript';
import { TimingLights } from './components/TimingLights';
import { findTimingPreset } from './club-climate-cue.utils';
import { useClubClimateCue } from './use-club-climate-cue';

export function ClubClimateCue(): ReactElement {
  const prompter = useClubClimateCue();
  const preset = findTimingPreset(TIMING_PRESETS, prompter.presetId);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-black text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-[42%] z-10 h-16 border-y border-white/15 bg-white/[0.04]"
        aria-hidden
      />

      <div className="pointer-events-none absolute right-3 top-3 z-30 safe-top sm:right-5">
        <div className="pointer-events-auto">
          <TimingLights
            formattedTime={prompter.formattedTime}
            light={prompter.light}
            isOvertime={prompter.isOvertime}
            running={prompter.timerRunning}
            onToggle={prompter.toggleTimer}
            onReset={prompter.resetTimer}
            preset={preset}
            presets={TIMING_PRESETS}
            presetId={prompter.presetId}
            onPresetChange={prompter.setPresetId}
          />
        </div>
      </div>

      <div className="absolute left-3 right-44 top-3 z-30 max-w-[calc(100%-12rem)] safe-top sm:right-52">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
          {prompter.segment.title} · {prompter.segmentIndex + 1} of {prompter.segmentCount}
        </p>
        <SegmentQueue
          segments={MEETING_SEGMENTS}
          currentIndex={prompter.segmentIndex}
          onSelect={prompter.goToSegment}
        />
      </div>

      <div
        className="absolute left-0 right-0 top-0 z-20 h-1 bg-white/10"
        aria-hidden
      >
        <div
          className="h-full bg-white/70"
          style={{ width: `${prompter.progressPercent}%` }}
        />
      </div>

      <div
        ref={prompter.scrollerRef}
        className="h-full overflow-y-auto overscroll-contain pt-28"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 16%, black 72%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 16%, black 72%, transparent 100%)',
        }}
        onClick={prompter.toggleScroll}
      >
        <div className="h-[42vh]" aria-hidden />
        <SpeechScript
          key={prompter.segment.id}
          cues={prompter.segment.cues}
          fontScale={prompter.fontScale}
        />
        <div className="h-[58vh]" aria-hidden />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/90 px-3 py-3 safe-bottom sm:px-5">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={prompter.goToPrevSegment}
            disabled={prompter.segmentIndex === 0}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-4 text-base font-semibold text-white hover:bg-white/10 disabled:opacity-40"
          >
            Previous part
          </button>
          <button
            type="button"
            onClick={prompter.toggleScroll}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-white px-4 text-base font-semibold text-black hover:bg-white/90"
          >
            {prompter.scrolling ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={prompter.goToNextSegment}
            disabled={prompter.segmentIndex >= prompter.segmentCount - 1}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-4 text-base font-semibold text-white hover:bg-white/10 disabled:opacity-40"
          >
            Next part
          </button>
          <div className="grid grid-cols-4 gap-2 sm:flex sm:w-auto">
            <button
              type="button"
              onClick={() => prompter.bumpSpeed(-1)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Slower
            </button>
            <button
              type="button"
              onClick={() => prompter.bumpSpeed(1)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Faster
            </button>
            <button
              type="button"
              onClick={() => prompter.bumpFont(-1)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/25 px-3 text-base font-semibold text-white hover:bg-white/10"
              aria-label="Smaller text"
            >
              A−
            </button>
            <button
              type="button"
              onClick={() => prompter.bumpFont(1)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/25 px-3 text-base font-semibold text-white hover:bg-white/10"
              aria-label="Larger text"
            >
              A+
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
