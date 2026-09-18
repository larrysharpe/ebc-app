import type { ReactElement } from 'react';

import type { SegmentQueueProps } from './SegmentQueue.types';

export function SegmentQueue({
  segments,
  currentIndex,
  onSelect,
}: SegmentQueueProps): ReactElement {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {segments.map((segment, index) => {
        const selected = index === currentIndex;
        return (
          <button
            key={segment.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm font-semibold ${
              selected
                ? 'bg-white text-black'
                : 'border border-white/25 bg-white/5 text-white hover:bg-white/10'
            }`}
            aria-current={selected ? 'true' : undefined}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
