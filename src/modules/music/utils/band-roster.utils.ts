import type {
  BandInstrument,
  BandMusician,
  MusicianSlotRole,
  SundayOfMonth,
} from '../types';
import { BAND_INSTRUMENT_LABELS, BAND_INSTRUMENT_ORDER } from '../types';
import { formatSundayLabel } from './choir-schedule.utils';

const SUNDAY_ORDER: SundayOfMonth[] = [1, 2, 3, 4, 5];

/** Lower = higher on the depth chart. */
export const DEPTH_CHART_ROLE_ORDER: Record<MusicianSlotRole, number> = {
  primary: 0,
  every_other: 1,
  backup: 2,
  emergency: 3,
  song_fill: 4,
  special: 5,
};

export type SplitBandRoster = {
  regular: BandMusician[];
  guests: BandMusician[];
};

function formatSundayList(sundays: SundayOfMonth[]): string {
  return sundays.map((s) => formatSundayLabel(s).replace(' Sunday', '')).join(', ');
}

export function formatGuestServiceDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function splitBandRoster(roster: BandMusician[]): SplitBandRoster {
  const regular: BandMusician[] = [];
  const guests: BandMusician[] = [];

  for (const musician of roster) {
    if (musician.playerType === 'guest') {
      guests.push(musician);
    } else {
      regular.push(musician);
    }
  }

  guests.sort((a, b) => (a.guestServiceDate ?? '').localeCompare(b.guestServiceDate ?? ''));

  return { regular, guests };
}

export function getUpcomingGuests(
  roster: BandMusician[],
  todayIso = new Date().toISOString().slice(0, 10),
): BandMusician[] {
  return splitBandRoster(roster).guests.filter(
    (guest) => !guest.guestServiceDate || guest.guestServiceDate >= todayIso,
  );
}

export function formatMusicianName(musician: BandMusician): string {
  if (musician.namePending) {
    return `${musician.name} (name TBD)`;
  }
  return musician.name;
}

export function compareDepthChart(a: BandMusician, b: BandMusician): number {
  const roleDiff =
    DEPTH_CHART_ROLE_ORDER[a.role] - DEPTH_CHART_ROLE_ORDER[b.role];
  if (roleDiff !== 0) return roleDiff;
  const orderDiff = (a.depthOrder ?? 0) - (b.depthOrder ?? 0);
  if (orderDiff !== 0) return orderDiff;
  return a.name.localeCompare(b.name);
}

export function formatMusicianInstruments(musician: BandMusician): string {
  const primary = `${BAND_INSTRUMENT_LABELS[musician.instrument]} (primary)`;
  const secondary = (musician.secondaryInstruments ?? []).map(
    (instrument) => `${BAND_INSTRUMENT_LABELS[instrument]} (secondary)`,
  );
  return [primary, ...secondary].join(' · ');
}

export function formatMusicianSchedule(musician: BandMusician): string {
  if (musician.playerType === 'guest' && musician.guestServiceDate) {
    return formatGuestServiceDate(musician.guestServiceDate);
  }

  const parts: string[] = [];

  if (musician.sundays?.length) {
    parts.push(formatSundayList(musician.sundays));
  }

  if (musician.everyOther2nd) {
    parts.push('every other 2nd');
  }

  if (parts.length === 0) {
    if (musician.role === 'emergency') return 'Emergency';
    if (musician.role === 'backup') return 'Backup';
    if (musician.role === 'song_fill') return 'Song fill-in';
    if (musician.role === 'special') return 'As needed';
    return 'TBD';
  }

  return parts.join('; ');
}

export function formatMusicianDetail(musician: BandMusician): string {
  const schedule = formatMusicianSchedule(musician);
  if (musician.notes) {
    return `${schedule} — ${musician.notes}`;
  }
  return schedule;
}

export function groupBandByInstrument(
  roster: BandMusician[],
): Record<BandInstrument, BandMusician[]> {
  const grouped = Object.fromEntries(
    BAND_INSTRUMENT_ORDER.map((i) => [i, [] as BandMusician[]]),
  ) as Record<BandInstrument, BandMusician[]>;

  for (const musician of roster) {
    if (musician.playerType === 'guest') continue;
    grouped[musician.instrument].push(musician);
  }

  for (const instrument of BAND_INSTRUMENT_ORDER) {
    grouped[instrument].sort(compareDepthChart);
  }

  return grouped;
}

/** Musicians assigned to a given Sunday (regular rotation only). */
export function getMusiciansForSunday(
  roster: BandMusician[],
  sunday: SundayOfMonth,
): BandMusician[] {
  return roster.filter((m) => {
    if (m.playerType === 'guest') return false;
    if (m.sundays?.includes(sunday)) return true;
    if (m.everyOther2nd && sunday === 2) return true;
    return false;
  });
}

export function buildSundayBandMatrix(
  roster: BandMusician[],
): { sunday: SundayOfMonth; byInstrument: Record<BandInstrument, BandMusician[]> }[] {
  return SUNDAY_ORDER.map((sunday) => {
    const musicians = getMusiciansForSunday(roster, sunday);
    const byInstrument = Object.fromEntries(
      BAND_INSTRUMENT_ORDER.map((instrument) => [
        instrument,
        musicians.filter((m) => m.instrument === instrument),
      ]),
    ) as Record<BandInstrument, BandMusician[]>;

    return { sunday, byInstrument };
  });
}
