'use client';

import { useMemo, useState } from 'react';

import {
  compareSortValues,
  toggleSortState,
  type SortState,
} from '@/lib/table-sort';

export function useSortableRows<T, K extends string>(
  rows: readonly T[],
  getSortValue: (row: T, key: K) => string | number | null | undefined,
  initial: SortState<K>,
): {
  sortedRows: T[];
  sort: SortState<K>;
  onSort: (key: K) => void;
} {
  const [sort, setSort] = useState<SortState<K>>(initial);

  const sortedRows = useMemo(() => {
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort(
      (a, b) =>
        compareSortValues(getSortValue(a, sort.key), getSortValue(b, sort.key)) *
        factor,
    );
  }, [rows, sort, getSortValue]);

  function onSort(key: K): void {
    setSort((current) => toggleSortState(current, key));
  }

  return { sortedRows, sort, onSort };
}
