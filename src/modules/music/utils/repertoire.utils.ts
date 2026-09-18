import type { ChoirGroup, ServiceMusicPlan, Song } from '../types';
import { getChoirName } from './choir.utils';
import { formatServiceDate } from './music.format';

/** Lookback for “trending” (recent rotation). */
export const REPERTOIRE_TRENDING_DAYS = 90;

/** Songs not sung for this many days count as “ready to rest / bring back”. */
export const REPERTOIRE_RESTING_DAYS = 60;

export type RepertoireSongStat = {
  songId: string;
  title: string;
  artist?: string;
  themes: string[];
  timesSung: number;
  lastSungDate?: string;
  daysSinceLastSung: number | null;
  choirGroups: ChoirGroup[];
};

export type RepertoireSnapshot = {
  asOf: string;
  trending: RepertoireSongStat[];
  resting: RepertoireSongStat[];
  neverSung: RepertoireSongStat[];
  recentThemes: string[];
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(later: Date, earlier: Date): number {
  const ms = startOfDay(later).getTime() - startOfDay(earlier).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function parseIsoDate(iso: string): Date | null {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Aggregate sent-plan song usage for choir directors.
 * Draft plans are ignored so “trending” reflects what actually went to choir.
 */
export function buildRepertoireSnapshot(
  songs: Song[],
  plans: ServiceMusicPlan[],
  now: Date = new Date(),
): RepertoireSnapshot {
  const sentPlans = plans.filter((plan) => plan.status === 'sent');
  const songById = new Map(songs.map((song) => [song.id, song]));

  type Acc = {
    timesSung: number;
    lastSungDate?: string;
    choirGroups: Set<ChoirGroup>;
    themes: Set<string>;
  };

  const bySong = new Map<string, Acc>();

  for (const plan of sentPlans) {
    const planDate = parseIsoDate(plan.serviceDate);
    if (!planDate) continue;

    for (const slot of plan.songs) {
      if (!slot.songId) continue;
      const song = songById.get(slot.songId);
      if (!song) continue;

      const existing = bySong.get(song.id) ?? {
        timesSung: 0,
        choirGroups: new Set<ChoirGroup>(),
        themes: new Set<string>(),
      };

      existing.timesSung += 1;
      existing.choirGroups.add(plan.choirGroup);
      for (const theme of song.themes) existing.themes.add(theme);

      if (
        !existing.lastSungDate ||
        plan.serviceDate > existing.lastSungDate
      ) {
        existing.lastSungDate = plan.serviceDate;
      }

      bySong.set(song.id, existing);
    }
  }

  const stats: RepertoireSongStat[] = songs.map((song) => {
    const acc = bySong.get(song.id);
    const lastSungDate = acc?.lastSungDate;
    const lastDate = lastSungDate ? parseIsoDate(lastSungDate) : null;
    const daysSinceLastSung =
      lastDate !== null ? daysBetween(now, lastDate) : null;

    return {
      songId: song.id,
      title: song.title,
      artist: song.artist,
      themes: song.themes,
      timesSung: acc?.timesSung ?? 0,
      lastSungDate,
      daysSinceLastSung,
      choirGroups: acc ? [...acc.choirGroups] : [],
    };
  });

  const trending = stats
    .filter(
      (stat) =>
        stat.daysSinceLastSung !== null &&
        stat.daysSinceLastSung <= REPERTOIRE_TRENDING_DAYS &&
        stat.timesSung > 0,
    )
    .sort((a, b) => {
      if (b.timesSung !== a.timesSung) return b.timesSung - a.timesSung;
      return (a.daysSinceLastSung ?? 9999) - (b.daysSinceLastSung ?? 9999);
    })
    .slice(0, 8);

  const resting = stats
    .filter(
      (stat) =>
        stat.timesSung > 0 &&
        stat.daysSinceLastSung !== null &&
        stat.daysSinceLastSung >= REPERTOIRE_RESTING_DAYS,
    )
    .sort((a, b) => (b.daysSinceLastSung ?? 0) - (a.daysSinceLastSung ?? 0))
    .slice(0, 8);

  const neverSung = stats
    .filter((stat) => stat.timesSung === 0)
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 8);

  const themeCounts = new Map<string, number>();
  for (const stat of trending) {
    for (const theme of stat.themes) {
      themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
    }
  }
  const recentThemes = [...themeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme)
    .slice(0, 6);

  return {
    asOf: startOfDay(now).toISOString().slice(0, 10),
    trending,
    resting,
    neverSung,
    recentThemes,
  };
}

export function formatRepertoireStatLine(stat: RepertoireSongStat): string {
  const choirs =
    stat.choirGroups.length > 0
      ? stat.choirGroups.map((g) => getChoirName(g)).join(', ')
      : '—';
  if (!stat.lastSungDate) {
    return `${stat.title} · never on a sent plan · themes: ${stat.themes.join(', ') || '—'}`;
  }
  return `${stat.title} · sung ${stat.timesSung}× · last ${formatServiceDate(stat.lastSungDate)} (${stat.daysSinceLastSung ?? '?'}d ago) · ${choirs}`;
}
