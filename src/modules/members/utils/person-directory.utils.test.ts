import { describe, expect, it } from 'vitest';

import {
  buildDirectoryPageMeta,
  clampPage,
  directoryHref,
  pageOffset,
  parseDirectorySearchParams,
} from './person-directory.utils';

describe('person-directory.utils', () => {
  it('clamps page within range', () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(3, 5)).toBe(3);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(2, 0)).toBe(1);
  });

  it('computes offsets and page meta', () => {
    expect(pageOffset(1, 25)).toBe(0);
    expect(pageOffset(3, 25)).toBe(50);
    expect(buildDirectoryPageMeta({ page: 2, pageSize: 25, total: 60 })).toEqual({
      page: 2,
      pageSize: 25,
      total: 60,
      totalPages: 3,
    });
    expect(buildDirectoryPageMeta({ page: 9, pageSize: 25, total: 0 })).toEqual({
      page: 1,
      pageSize: 25,
      total: 0,
      totalPages: 1,
    });
  });

  it('parses and builds directory URLs', () => {
    expect(
      parseDirectorySearchParams({ q: ' lydia ', status: 'member', page: '2' }),
    ).toEqual({
      q: 'lydia',
      status: 'member',
      page: 2,
      sort: undefined,
      dir: undefined,
    });
    expect(
      parseDirectorySearchParams({ sort: 'firstName', dir: 'desc' }),
    ).toEqual({
      q: undefined,
      status: undefined,
      page: 1,
      sort: 'firstName',
      dir: 'desc',
    });
    expect(directoryHref({ q: 'lydia', status: 'member', page: 2 })).toBe(
      '/people?q=lydia&status=member&page=2',
    );
    expect(
      directoryHref({ sort: 'firstName', dir: 'desc', page: 1 }),
    ).toBe('/people?sort=firstName&dir=desc');
    expect(directoryHref({ page: 1 })).toBe('/people');
  });
});
