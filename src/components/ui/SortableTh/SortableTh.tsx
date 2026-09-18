'use client';

import type { SortDirection, SortState } from '@/lib/table-sort';
import { ariaSortValue } from '@/lib/table-sort';

export type SortableThProps<K extends string> = {
  label: string;
  columnKey: K;
  sort: SortState<K> | null;
  onSort: (key: K) => void;
  align?: 'left' | 'right';
  className?: string;
};

function sortIndicator(active: boolean, direction: SortDirection | undefined): string {
  if (!active) return '↕';
  return direction === 'asc' ? '↑' : '↓';
}

export function SortableTh<K extends string>({
  label,
  columnKey,
  sort,
  onSort,
  align = 'left',
  className = '',
}: SortableThProps<K>) {
  const active = sort?.key === columnKey;
  const alignClass = align === 'right' ? 'text-right' : 'text-left';

  return (
    <th
      scope="col"
      aria-sort={ariaSortValue(sort, columnKey)}
      className={`px-4 py-3 ${alignClass} ${className}`.trim()}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide transition-colors ${
          active ? 'text-ebc-burgundy' : 'text-slate-500 hover:text-ebc-burgundy'
        }`}
      >
        <span>{label}</span>
        <span className="text-[10px] font-normal opacity-70" aria-hidden>
          {sortIndicator(active, sort?.direction)}
        </span>
      </button>
    </th>
  );
}
