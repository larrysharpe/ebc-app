import { describe, expect, it } from 'vitest';

import {
  ariaSortValue,
  compareSortValues,
  sortRows,
  toggleSortState,
} from './table-sort';

describe('table-sort', () => {
  it('toggles direction on the same column', () => {
    const first = toggleSortState(null, 'name');
    expect(first).toEqual({ key: 'name', direction: 'asc' });
    expect(toggleSortState(first, 'name')).toEqual({
      key: 'name',
      direction: 'desc',
    });
    expect(toggleSortState(first, 'email')).toEqual({
      key: 'email',
      direction: 'asc',
    });
  });

  it('compares nulls last and sorts strings/numbers', () => {
    expect(compareSortValues(null, 'a')).toBe(1);
    expect(compareSortValues('b', 'a')).toBeGreaterThan(0);
    expect(compareSortValues(2, 10)).toBeLessThan(0);
  });

  it('sorts rows by getter', () => {
    const rows = [{ name: 'Zoe' }, { name: 'Ann' }, { name: 'Mia' }];
    expect(
      sortRows(rows, { key: 'name', direction: 'asc' }, { name: (r) => r.name }).map(
        (r) => r.name,
      ),
    ).toEqual(['Ann', 'Mia', 'Zoe']);
  });

  it('maps aria-sort', () => {
    expect(ariaSortValue({ key: 'name', direction: 'desc' }, 'name')).toBe(
      'descending',
    );
    expect(ariaSortValue({ key: 'name', direction: 'asc' }, 'email')).toBe('none');
  });
});
