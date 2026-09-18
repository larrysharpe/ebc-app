export type SortDirection = 'asc' | 'desc';

export type SortState<K extends string> = {
  key: K;
  direction: SortDirection;
};

export function toggleSortState<K extends string>(
  current: SortState<K> | null,
  nextKey: K,
  defaultDirection: SortDirection = 'asc',
): SortState<K> {
  if (current?.key === nextKey) {
    return {
      key: nextKey,
      direction: current.direction === 'asc' ? 'desc' : 'asc',
    };
  }
  return { key: nextKey, direction: defaultDirection };
}

export function compareSortValues(
  left: string | number | null | undefined,
  right: string | number | null | undefined,
): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    sensitivity: 'base',
    numeric: true,
  });
}

export function sortRows<T, K extends string>(
  rows: readonly T[],
  state: SortState<K>,
  getters: Record<K, (row: T) => string | number | null | undefined>,
): T[] {
  const getter = getters[state.key];
  const factor = state.direction === 'asc' ? 1 : -1;
  return [...rows].sort(
    (a, b) => compareSortValues(getter(a), getter(b)) * factor,
  );
}

export function ariaSortValue(
  state: SortState<string> | null,
  columnKey: string,
): 'ascending' | 'descending' | 'none' {
  if (!state || state.key !== columnKey) return 'none';
  return state.direction === 'asc' ? 'ascending' : 'descending';
}
