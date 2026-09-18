import { describe, expect, it } from 'vitest';

import type { SongRequest } from '../types/song-request.types';
import { normalizeSongThemes, songFromApprovedRequest } from './song-request.utils';

describe('song-request.utils', () => {
  it('normalizes theme labels', () => {
    expect(normalizeSongThemes(['Praise & Worship', '  Advent  ', 'praise'])).toEqual([
      'praise_worship',
      'advent',
      'praise',
    ]);
  });

  it('builds a catalog song from an approved request', () => {
    const request: SongRequest = {
      id: 'req-1',
      title: 'Total Praise',
      artist: 'Richard Smallwood',
      themes: [],
      status: 'pending',
      createdAt: '',
      updatedAt: '',
    };
    const song = songFromApprovedRequest(request);
    expect(song.title).toBe('Total Praise');
    expect(song.artist).toBe('Richard Smallwood');
    expect(song.themes).toEqual(['general']);
    expect(song.id.startsWith('song-')).toBe(true);
  });
});
