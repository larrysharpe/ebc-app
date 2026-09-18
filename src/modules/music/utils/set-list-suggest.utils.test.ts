import { describe, expect, it } from 'vitest';

import type { ServiceMusicPlan, Song } from '../types';
import {
  buildSetListSuggestPrompt,
  extractJsonObject,
  parseSetListSuggestResponse,
} from './set-list-suggest.utils';
import type { RepertoireSnapshot } from './repertoire.utils';

const plan: ServiceMusicPlan = {
  id: 'plan-1',
  title: 'Morning Worship',
  choirGroup: 'adult',
  serviceDate: '2026-07-19',
  occasion: 'Communion Sunday',
  status: 'draft',
  directorName: 'Director',
  songs: [
    {
      id: 'slot-1',
      sortOrder: 1,
      slotType: 'welcome',
      assignments: 'All',
    },
    {
      id: 'slot-2',
      sortOrder: 2,
      slotType: 'worship',
      assignments: 'All',
    },
  ],
};

const songs: Song[] = [
  {
    id: 'song-a',
    title: 'Great Is Thy Faithfulness',
    themes: ['faithfulness'],
  },
  {
    id: 'song-b',
    title: 'Total Praise',
    themes: ['worship'],
  },
];

const emptySnapshot: RepertoireSnapshot = {
  asOf: '2026-07-18',
  trending: [],
  resting: [],
  neverSung: [],
  recentThemes: [],
};

describe('extractJsonObject', () => {
  it('parses a fenced JSON block', () => {
    const text = 'Here you go:\n```json\n{"summary":"ok","slots":[]}\n```';
    expect(extractJsonObject(text)).toEqual({ summary: 'ok', slots: [] });
  });
});

describe('parseSetListSuggestResponse', () => {
  it('keeps only valid slot and song ids', () => {
    const text = JSON.stringify({
      summary: 'Communion-focused set with balance.',
      slots: [
        {
          slotId: 'slot-1',
          songId: 'song-a',
          reason: 'Familiar welcome for Communion.',
        },
        {
          slotId: 'slot-2',
          songId: 'song-missing',
          reason: 'Unknown song dropped.',
        },
        {
          slotId: 'slot-x',
          songId: 'song-b',
          reason: 'Unknown slot dropped.',
        },
      ],
    });

    const result = parseSetListSuggestResponse(
      text,
      plan,
      new Set(['song-a', 'song-b']),
    );

    expect(result.summary).toContain('Communion');
    expect(result.slots).toEqual([
      {
        slotId: 'slot-1',
        songId: 'song-a',
        reason: 'Familiar welcome for Communion.',
      },
      {
        slotId: 'slot-2',
        songId: null,
        reason: 'Unknown song dropped.',
      },
    ]);
  });
});

describe('buildSetListSuggestPrompt', () => {
  it('includes occasion, slots, and catalog ids', () => {
    const prompt = buildSetListSuggestPrompt({
      plan,
      songs,
      snapshot: emptySnapshot,
    });
    expect(prompt).toContain('Communion Sunday');
    expect(prompt).toContain('slotId=slot-1');
    expect(prompt).toContain('songId=song-a');
    expect(prompt).toContain('Respond with JSON only');
  });
});
