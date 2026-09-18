import type { ReactElement } from 'react';

import type { TimingLight, TimingPresetId } from '../../club-climate-cue.types';
import { formatSpeechTime } from '../../club-climate-cue.utils';

import type { TimingLightsProps } from './TimingLights.types';

const LIGHTS: { id: TimingLight; label: string }[] = [
  { id: 'green', label: 'Green' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'red', label: 'Red' },
];

function lightClassName(id: TimingLight, active: TimingLight, overtime: boolean): string {
  const isOn = active === id;
  const pulse = isOn && id === 'red' && overtime ? 'animate-pulse' : '';
  if (!isOn) {
    return `bg-slate-700 ring-1 ring-white/10 ${pulse}`;
  }
  if (id === 'green') {
    return `bg-green-400 shadow-[0_0_18px_rgba(74,222,128,0.95)] ${pulse}`;
  }
  if (id === 'yellow') {
    return `bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.95)] ${pulse}`;
  }
  return `bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.95)] ${pulse}`;
}

export function TimingLights({
  formattedTime,
  light,
  isOvertime,
  running,
  onToggle,
  onReset,
  preset,
  presets,
  presetId,
  onPresetChange,
}: TimingLightsProps): ReactElement {
  const showLights = preset.lights;
  const marks = [
    formatSpeechTime(preset.greenSeconds),
    formatSpeechTime(preset.yellowSeconds),
    formatSpeechTime(preset.redSeconds),
  ];

  return (
    <div className="w-40 shrink-0 rounded-2xl border border-white/15 bg-black/80 p-2.5 text-center shadow-lg sm:w-44">
      <p
        className={`font-mono text-3xl font-bold tabular-nums tracking-wide ${
          isOvertime ? 'animate-pulse text-red-400' : 'text-white'
        }`}
        aria-live="off"
      >
        {formattedTime}
      </p>

      {showLights ? (
        <div className="mt-2 flex items-end justify-center gap-2.5" role="img" aria-label={`${light} timing light`}>
          {LIGHTS.map((item, i) => (
            <div key={item.id} className="flex flex-col items-center gap-1">
              <span
                className={`h-6 w-6 rounded-full sm:h-7 sm:w-7 ${lightClassName(item.id, light, isOvertime)}`}
                title={`${item.label} at ${marks[i]}`}
              />
              <span className="font-mono text-[10px] text-white/50">{marks[i]}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[11px] uppercase tracking-wider text-white/45">Clock only</p>
      )}
      <p className="sr-only" aria-live="polite">
        {light === 'off' ? 'No timing light yet' : `${light} light`}
        {isOvertime ? '. Over time.' : ''}
      </p>

      <label className="mt-2 block text-left text-[11px] font-medium text-white/50">
        Length
        <select
          className="mt-1 min-h-11 w-full rounded-xl border border-white/15 bg-zinc-950 px-2 text-sm text-white"
          value={presetId}
          onChange={(event) => onPresetChange(event.target.value as TimingPresetId)}
        >
          {presets.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ebc-green px-2 text-sm font-semibold text-white hover:bg-ebc-green-dark"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
