import type { TimingLight, TimingPreset, TimingPresetId } from '../../club-climate-cue.types';

export type TimingLightsProps = {
  formattedTime: string;
  light: TimingLight;
  isOvertime: boolean;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  preset: TimingPreset;
  presets: readonly TimingPreset[];
  presetId: TimingPresetId;
  onPresetChange: (id: TimingPresetId) => void;
};
