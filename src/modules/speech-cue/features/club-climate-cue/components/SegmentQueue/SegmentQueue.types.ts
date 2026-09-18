import type { MeetingSegment } from '../../club-climate-cue.types';

export type SegmentQueueProps = {
  segments: readonly MeetingSegment[];
  currentIndex: number;
  onSelect: (index: number) => void;
};
