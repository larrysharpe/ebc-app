import { describe, expect, it } from 'vitest';

import type { Song } from '@/modules/music/types';

import { filterCatalogSongs } from './plan-song-picker.utils';

const songs: Song[] = [
  { id: '1', title: 'Amazing Grace', artist: 'Traditional', themes: ['grace'] },
  { id: '2', title: 'Total Praise', artist: 'Richard Smallwood', themes: ['praise'] },
  { id: '3', title: 'Order My Steps', themes: ['guidance'] },
];

describe('filterCatalogSongs', () => {
  it('returns all songs when query is empty', () => {
    expect(filterCatalogSongs(songs, '')).toHaveLength(3);
  });

  it('matches title, artist, and theme', () => {
    expect(filterCatalogSongs(songs, 'smallwood').map((s) => s.id)).toEqual(['2']);
    expect(filterCatalogSongs(songs, 'grace').map((s) => s.id)).toEqual(['1']);
    expect(filterCatalogSongs(songs, 'guidance').map((s) => s.id)).toEqual(['3']);
  });
});
