import { describe, expect, it } from 'vitest';

import type { ServiceMusicPlan, Song } from '../types';
import { buildPlanEmailBody } from './music.format';

const songs: Song[] = [
  {
    id: 'song-a',
    title: "If You're Happy",
    artist: 'Whitehaven District Choir',
    youtubeUrl: 'https://youtu.be/uM5KQd_Go6o',
    themes: [],
  },
];

const basePlan: ServiceMusicPlan = {
  id: 'plan-test',
  title: 'Little Zion Revival · Gospel Choir',
  choirGroup: 'adult',
  serviceDate: '2026-08-05',
  serviceStartTime: '19:00',
  serviceEndTime: '20:30',
  arrivalTime: '18:20',
  attire: 'Casual Black & White',
  occasion: 'Revival Service at Little Zion',
  directorNotes: '<p>Order of service still pending.</p>',
  directorName: 'Niki Jennings',
  status: 'draft',
  songs: [
    {
      id: 'slot-1',
      sortOrder: 1,
      songId: 'song-a',
      slotType: 'worship',
      assignments: 'All',
    },
  ],
};

describe('buildPlanEmailBody', () => {
  it('includes service details, song YouTube links, and director notes for share', () => {
    const body = buildPlanEmailBody(basePlan, songs, {
      location: 'Little Zion Baptist Church, Nokesville, VA',
      appHref: 'https://app.example/music/plans/plan-test/rehearse',
    });

    expect(body).toContain('Little Zion Revival · Gospel Choir');
    expect(body).toContain('Location: Little Zion Baptist Church, Nokesville, VA');
    expect(body).toContain('Arrival time: 6:20 PM');
    expect(body).toContain('Time: 7 PM–8:30 PM');
    expect(body).toContain("If You're Happy");
    expect(body).toContain('https://youtu.be/uM5KQd_Go6o');
    expect(body).toContain('Order of service still pending.');
    expect(body).toContain('Niki Jennings');
    expect(body).toContain('Open in the app:');
    expect(body).not.toContain('Scripture:');
  });
});
