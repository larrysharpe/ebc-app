import { describe, expect, it } from 'vitest';

import type { Ministry } from '@/modules/ministries/types';

import { affiliationsForPerson } from './person-ministry.utils';

const ministries = [
  {
    id: 'min-a',
    slug: 'media',
    name: 'Media',
    personnel: [
      { id: 'p1', personId: 'person-1', name: 'Ann', role: 'member' },
      { id: 'p2', personId: 'person-2', name: 'Bob', role: 'director' },
    ],
  },
  {
    id: 'min-b',
    slug: 'jamm',
    name: 'JAMM',
    personnel: [
      {
        id: 'p3',
        personId: 'person-1',
        name: 'Ann',
        role: 'volunteer',
        title: 'Camera',
      },
    ],
  },
] as unknown as Ministry[];

describe('affiliationsForPerson', () => {
  it('returns roster placements for a person across ministries', () => {
    const rows = affiliationsForPerson('person-1', ministries);
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.slug)).toEqual(['jamm', 'media']);
    expect(rows[0]?.title).toBe('Camera');
  });

  it('returns empty when person is not on any roster', () => {
    expect(affiliationsForPerson('person-missing', ministries)).toEqual([]);
  });
});
