import { describe, expect, it } from 'vitest';

import type { ServiceMusicPlan, Song } from '../types';
import { buildRepertoireSnapshot, formatRepertoireStatLine } from './repertoire.utils';

const songs: Song[] = [
  { id: 'a', title: 'Alpha', themes: ['worship'] },
  { id: 'b', title: 'Bravo', themes: ['sermonic'] },
  { id: 'c', title: 'Charlie', themes: ['youth'] },
];

function plan(
  id: string,
  serviceDate: string,
  songIds: string[],
  status: 'sent' | 'draft' = 'sent',
): ServiceMusicPlan {
  return {
    id,
    title: id,
    choirGroup: 'adult',
    serviceDate,
    status,
    directorName: 'Director',
    songs: songIds.map((songId, index) => ({
      id: `${id}-${index}`,
      sortOrder: index,
      songId,
      slotType: 'worship',
      assignments: 'All',
    })),
  };
}

describe('buildRepertoireSnapshot', () => {
  it('ranks recent sent usage as trending and ignores drafts', () => {
    const now = new Date('2026-07-18T12:00:00');
    const snapshot = buildRepertoireSnapshot(
      songs,
      [
        plan('p1', '2026-07-05', ['a', 'a']),
        plan('p2', '2026-06-01', ['a', 'b']),
        plan('p3', '2026-07-12', ['b'], 'draft'),
        plan('p4', '2025-01-01', ['c']),
      ],
      now,
    );

    expect(snapshot.trending.map((s) => s.songId)).toEqual(['a', 'b']);
    expect(snapshot.trending[0]?.timesSung).toBe(3);
    expect(snapshot.resting.map((s) => s.songId)).toContain('c');
    expect(snapshot.neverSung).toHaveLength(0);
    expect(snapshot.recentThemes).toContain('worship');
  });

  it('lists catalog songs never used on a sent plan', () => {
    const now = new Date('2026-07-18T12:00:00');
    const snapshot = buildRepertoireSnapshot(
      songs,
      [plan('p1', '2026-07-05', ['a'])],
      now,
    );

    expect(snapshot.neverSung.map((s) => s.songId).sort()).toEqual(['b', 'c']);
  });
});

describe('formatRepertoireStatLine', () => {
  it('formats never-sung and sung lines', () => {
    expect(
      formatRepertoireStatLine({
        songId: 'x',
        title: 'New Song',
        themes: ['worship'],
        timesSung: 0,
        daysSinceLastSung: null,
        choirGroups: [],
      }),
    ).toContain('never on a sent plan');

    expect(
      formatRepertoireStatLine({
        songId: 'a',
        title: 'Alpha',
        themes: ['worship'],
        timesSung: 2,
        lastSungDate: '2026-07-05',
        daysSinceLastSung: 13,
        choirGroups: ['adult'],
      }),
    ).toMatch(/sung 2×/);
  });
});
