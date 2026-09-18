import { describe, expect, it } from 'vitest';

import type { BandMusician } from '@/modules/music/types';
import {
  compareDepthChart,
  formatMusicianInstruments,
  formatMusicianSchedule,
  getUpcomingGuests,
  splitBandRoster,
} from '@/modules/music/utils/band-roster.utils';

const regularMusician: BandMusician = {
  id: 'regular-1',
  name: 'Andre Porter',
  instrument: 'keys',
  secondaryInstruments: [],
  playerType: 'regular',
  sundays: [2, 3],
  role: 'primary',
  depthOrder: 0,
};

const guestMusician: BandMusician = {
  id: 'guest-1',
  name: 'Guest Keys',
  instrument: 'keys',
  secondaryInstruments: ['drums'],
  playerType: 'guest',
  guestServiceDate: '2026-08-09',
  role: 'special',
  depthOrder: 0,
};

describe('splitBandRoster', () => {
  it('separates regular and guest musicians', () => {
    const result = splitBandRoster([regularMusician, guestMusician]);
    expect(result.regular).toHaveLength(1);
    expect(result.guests).toHaveLength(1);
    expect(result.guests[0]?.id).toBe('guest-1');
  });
});

describe('getUpcomingGuests', () => {
  it('filters past guest dates', () => {
    const pastGuest: BandMusician = {
      ...guestMusician,
      id: 'guest-past',
      guestServiceDate: '2020-01-01',
    };
    const upcoming = getUpcomingGuests([pastGuest, guestMusician], '2026-01-01');
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0]?.id).toBe('guest-1');
  });
});

describe('formatMusicianSchedule', () => {
  it('shows service date for guests', () => {
    expect(formatMusicianSchedule(guestMusician)).toContain('2026');
  });
});

describe('compareDepthChart', () => {
  it('orders by role then depthOrder then name', () => {
    const primaryDeep: BandMusician = {
      ...regularMusician,
      id: 'a',
      name: 'Zoe',
      role: 'primary',
      depthOrder: 1,
    };
    const primaryTop: BandMusician = {
      ...regularMusician,
      id: 'b',
      name: 'Ann',
      role: 'primary',
      depthOrder: 0,
    };
    const backup: BandMusician = {
      ...regularMusician,
      id: 'c',
      name: 'Backup',
      role: 'backup',
      depthOrder: 0,
    };
    const songFill: BandMusician = {
      ...regularMusician,
      id: 'd',
      name: 'Song Fill',
      role: 'song_fill',
      depthOrder: 0,
    };

    const sorted = [songFill, backup, primaryDeep, primaryTop].sort(compareDepthChart);
    expect(sorted.map((m) => m.id)).toEqual(['b', 'a', 'c', 'd']);
  });
});

describe('formatMusicianInstruments', () => {
  it('labels primary and secondary instruments', () => {
    expect(formatMusicianInstruments(guestMusician)).toBe(
      'Keys (primary) · Drums (secondary)',
    );
  });
});
