import { prisma } from '@/lib/db';
import { MUSIC_SEED } from '../data/music.seed';
import type {
  BandMusician,
  ChoirGroup,
  ChoirScheduleOverride,
  MusicStore,
  PlanSongSlot,
  ServiceMusicPlan,
  Song,
} from '../types';
import {
  getPlanPractices,
  parsePracticesJson,
  withSyncedPractices,
} from '../utils/plan-practice.utils';

function mapSong(row: {
  id: string;
  title: string;
  artist: string | null;
  youtubeUrl: string | null;
  audioUrl: string | null;
  defaultKey: string | null;
  themes: string[];
  notes: string | null;
  lyricsText: string | null;
  copyrightNotes: string | null;
}): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist ?? undefined,
    youtubeUrl: row.youtubeUrl ?? undefined,
    audioUrl: row.audioUrl ?? undefined,
    defaultKey: row.defaultKey ?? undefined,
    themes: row.themes,
    notes: row.notes ?? undefined,
    lyricsText: row.lyricsText ?? undefined,
    copyrightNotes: row.copyrightNotes ?? undefined,
  };
}

function mapPlan(row: {
  id: string;
  title: string;
  choirGroup: string;
  serviceDate: string;
  churchEventId: string | null;
  sundayServiceId: string | null;
  sundayOfMonth: number | null;
  scheduleOverride: boolean;
  scheduleNote: string | null;
  serviceStartTime: string | null;
  serviceEndTime: string | null;
  arrivalTime: string | null;
  practiceDate: string | null;
  practiceStartTime: string | null;
  practiceEndTime: string | null;
  practiceLocation: string | null;
  practices: unknown;
  occasion: string | null;
  attire: string | null;
  scriptureReader: string | null;
  prayerLeader: string | null;
  directorNotes: string | null;
  postServiceMessage: string | null;
  status: string;
  sentAt: Date | null;
  directorName: string;
  songs: unknown;
}): ServiceMusicPlan {
  const mapped: ServiceMusicPlan = {
    id: row.id,
    title: row.title,
    choirGroup: row.choirGroup as ChoirGroup,
    serviceDate: row.serviceDate,
    churchEventId: row.churchEventId ?? undefined,
    sundayServiceId: row.sundayServiceId ?? undefined,
    sundayOfMonth: (row.sundayOfMonth ?? undefined) as ServiceMusicPlan['sundayOfMonth'],
    scheduleOverride: row.scheduleOverride,
    scheduleNote: row.scheduleNote ?? undefined,
    serviceStartTime: row.serviceStartTime ?? undefined,
    serviceEndTime: row.serviceEndTime ?? undefined,
    arrivalTime: row.arrivalTime ?? undefined,
    practiceDate: row.practiceDate ?? undefined,
    practiceStartTime: row.practiceStartTime ?? undefined,
    practiceEndTime: row.practiceEndTime ?? undefined,
    practiceLocation: row.practiceLocation ?? undefined,
    practices: parsePracticesJson(row.practices),
    occasion: row.occasion ?? undefined,
    attire: row.attire ?? undefined,
    scriptureReader: row.scriptureReader,
    prayerLeader: row.prayerLeader,
    directorNotes: row.directorNotes ?? undefined,
    postServiceMessage: row.postServiceMessage ?? undefined,
    status: row.status as ServiceMusicPlan['status'],
    sentAt: row.sentAt?.toISOString(),
    directorName: row.directorName,
    songs: row.songs as PlanSongSlot[],
  };
  return {
    ...mapped,
    practices: getPlanPractices(mapped),
  };
}

function mapOverride(row: {
  id: string;
  serviceDate: string;
  choirGroup: string;
  sundayOfMonth: number;
  note: string | null;
}): ChoirScheduleOverride {
  return {
    id: row.id,
    serviceDate: row.serviceDate,
    choirGroup: row.choirGroup as ChoirGroup,
    sundayOfMonth: row.sundayOfMonth as ChoirScheduleOverride['sundayOfMonth'],
    note: row.note ?? undefined,
  };
}

function mapMusician(row: {
  id: string;
  name: string;
  personId: string | null;
  instrument: string;
  secondaryInstruments: string[];
  playerType: string;
  guestServiceDate: string | null;
  sundays: number[];
  everyOther2nd: boolean;
  role: string;
  depthOrder: number;
  namePending: boolean;
  notes: string | null;
}): BandMusician {
  return {
    id: row.id,
    name: row.name,
    personId: row.personId ?? undefined,
    instrument: row.instrument as BandMusician['instrument'],
    secondaryInstruments: row.secondaryInstruments as BandMusician['secondaryInstruments'],
    playerType: (row.playerType === 'guest' ? 'guest' : 'regular') as BandMusician['playerType'],
    guestServiceDate: row.guestServiceDate ?? undefined,
    sundays: row.sundays as BandMusician['sundays'],
    everyOther2nd: row.everyOther2nd,
    role: row.role as BandMusician['role'],
    depthOrder: row.depthOrder ?? 0,
    namePending: row.namePending,
    notes: row.notes ?? undefined,
  };
}

export async function getMusicStore(): Promise<MusicStore> {
  const [songs, plans, scheduleOverrides, bandRoster] = await Promise.all([
    prisma.song.findMany({ orderBy: { title: 'asc' } }),
    prisma.serviceMusicPlan.findMany(),
    prisma.choirScheduleOverride.findMany(),
    prisma.bandMusician.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return {
    songs: songs.map(mapSong),
    plans: plans.map(mapPlan),
    scheduleOverrides: scheduleOverrides.map(mapOverride),
    bandRoster: bandRoster.map(mapMusician),
    updatedAt: new Date().toISOString(),
  };
}

export async function getSongs(): Promise<Song[]> {
  const rows = await prisma.song.findMany({ orderBy: { title: 'asc' } });
  return rows.map(mapSong);
}

export async function getSongById(id: string): Promise<Song | undefined> {
  const row = await prisma.song.findUnique({ where: { id } });
  return row ? mapSong(row) : undefined;
}

export async function createSong(song: Song): Promise<Song> {
  const row = await prisma.song.create({
    data: {
      id: song.id,
      title: song.title,
      artist: song.artist ?? null,
      youtubeUrl: song.youtubeUrl ?? null,
      audioUrl: song.audioUrl ?? null,
      defaultKey: song.defaultKey ?? null,
      themes: song.themes,
      notes: song.notes ?? null,
      lyricsText: song.lyricsText ?? null,
      copyrightNotes: song.copyrightNotes ?? null,
    },
  });
  return mapSong(row);
}

export async function getPlans(): Promise<ServiceMusicPlan[]> {
  const rows = await prisma.serviceMusicPlan.findMany({
    orderBy: { serviceDate: 'desc' },
  });
  return rows.map(mapPlan);
}

export async function getScheduleOverrides(): Promise<ChoirScheduleOverride[]> {
  const rows = await prisma.choirScheduleOverride.findMany({
    orderBy: { serviceDate: 'asc' },
  });
  return rows.map(mapOverride);
}

/** Link known seed musicians to Person rows when personId is still empty. */
async function ensureBandPersonLinks(): Promise<void> {
  const links: Array<{ id: string; personId: string; name: string }> = [
    {
      id: 'musician-andre-porter-keys',
      personId: 'person-andre-porter',
      name: 'Andre Porter',
    },
    {
      id: 'musician-lauren-guinyard-keys',
      personId: 'person-lauren-guinyard',
      name: 'Lauren Guinyard',
    },
    {
      id: 'musician-gore-bass',
      personId: 'person-gore',
      name: 'Gore',
    },
  ];

  for (const link of links) {
    const row = await prisma.bandMusician.findUnique({ where: { id: link.id } });
    if (!row || row.personId) continue;
    await prisma.bandMusician.update({
      where: { id: link.id },
      data: { personId: link.personId, name: link.name },
    });
  }
}

export async function getBandRoster(): Promise<BandMusician[]> {
  await ensureBandPersonLinks();
  const rows = await prisma.bandMusician.findMany({ orderBy: { name: 'asc' } });
  return rows.map(mapMusician);
}

export async function getPlanById(id: string): Promise<ServiceMusicPlan | undefined> {
  const row = await prisma.serviceMusicPlan.findUnique({ where: { id } });
  return row ? mapPlan(row) : undefined;
}

export async function markPlanSent(planId: string): Promise<ServiceMusicPlan | null> {
  try {
    const row = await prisma.serviceMusicPlan.update({
      where: { id: planId },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });
    return mapPlan(row);
  } catch {
    return null;
  }
}

export async function createPlan(
  plan: Omit<ServiceMusicPlan, 'sentAt'>,
): Promise<ServiceMusicPlan> {
  const synced = withSyncedPractices(
    { ...plan, sentAt: undefined },
    getPlanPractices(plan),
  );
  const row = await prisma.serviceMusicPlan.create({
    data: {
      id: synced.id,
      title: synced.title,
      choirGroup: synced.choirGroup,
      serviceDate: synced.serviceDate,
      churchEventId: synced.churchEventId ?? null,
      sundayServiceId: synced.sundayServiceId ?? null,
      sundayOfMonth: synced.sundayOfMonth ?? null,
      scheduleOverride: synced.scheduleOverride ?? false,
      scheduleNote: synced.scheduleNote ?? null,
      serviceStartTime: synced.serviceStartTime ?? null,
      serviceEndTime: synced.serviceEndTime ?? null,
      arrivalTime: synced.arrivalTime ?? null,
      practiceDate: synced.practiceDate ?? null,
      practiceStartTime: synced.practiceStartTime ?? null,
      practiceEndTime: synced.practiceEndTime ?? null,
      practiceLocation: synced.practiceLocation ?? null,
      practices: synced.practices ?? [],
      occasion: synced.occasion ?? null,
      attire: synced.attire ?? null,
      scriptureReader: synced.scriptureReader ?? null,
      prayerLeader: synced.prayerLeader ?? null,
      directorNotes: synced.directorNotes ?? null,
      postServiceMessage: synced.postServiceMessage ?? null,
      status: synced.status,
      sentAt: null,
      directorName: synced.directorName,
      songs: synced.songs,
    },
  });
  return mapPlan(row);
}

export async function updatePlan(plan: ServiceMusicPlan): Promise<ServiceMusicPlan | null> {
  try {
    const synced = withSyncedPractices(plan, getPlanPractices(plan));
    const row = await prisma.serviceMusicPlan.update({
      where: { id: synced.id },
      data: {
        title: synced.title,
        choirGroup: synced.choirGroup,
        serviceDate: synced.serviceDate,
        churchEventId: synced.churchEventId ?? null,
        sundayServiceId: synced.sundayServiceId ?? null,
        sundayOfMonth: synced.sundayOfMonth ?? null,
        scheduleOverride: synced.scheduleOverride ?? false,
        scheduleNote: synced.scheduleNote ?? null,
        serviceStartTime: synced.serviceStartTime ?? null,
        serviceEndTime: synced.serviceEndTime ?? null,
        arrivalTime: synced.arrivalTime ?? null,
        practiceDate: synced.practiceDate ?? null,
        practiceStartTime: synced.practiceStartTime ?? null,
        practiceEndTime: synced.practiceEndTime ?? null,
        practiceLocation: synced.practiceLocation ?? null,
        practices: synced.practices ?? [],
        occasion: synced.occasion ?? null,
        attire: synced.attire ?? null,
        scriptureReader: synced.scriptureReader ?? null,
        prayerLeader: synced.prayerLeader ?? null,
        directorNotes: synced.directorNotes ?? null,
        postServiceMessage: synced.postServiceMessage ?? null,
        status: synced.status,
        sentAt: synced.sentAt ? new Date(synced.sentAt) : null,
        directorName: synced.directorName,
        songs: synced.songs,
      },
    });
    return mapPlan(row);
  } catch {
    return null;
  }
}

export async function deletePlan(planId: string): Promise<boolean> {
  try {
    await prisma.serviceMusicPlan.delete({ where: { id: planId } });
    return true;
  } catch {
    return false;
  }
}

function musicianCreateData(musician: BandMusician) {
  return {
    id: musician.id,
    name: musician.name,
    personId: musician.personId ?? null,
    instrument: musician.instrument,
    secondaryInstruments: musician.secondaryInstruments ?? [],
    playerType: musician.playerType,
    guestServiceDate: musician.guestServiceDate ?? null,
    sundays: musician.sundays ?? [],
    everyOther2nd: musician.everyOther2nd ?? false,
    role: musician.role,
    depthOrder: musician.depthOrder ?? 0,
    namePending: musician.namePending ?? false,
    notes: musician.notes ?? null,
  };
}

export async function getBandMusicianById(id: string): Promise<BandMusician | undefined> {
  const row = await prisma.bandMusician.findUnique({ where: { id } });
  return row ? mapMusician(row) : undefined;
}

export async function createBandMusician(musician: BandMusician): Promise<BandMusician> {
  const row = await prisma.bandMusician.create({ data: musicianCreateData(musician) });
  return mapMusician(row);
}

export async function updateBandMusician(musician: BandMusician): Promise<BandMusician | null> {
  try {
    const row = await prisma.bandMusician.update({
      where: { id: musician.id },
      data: musicianCreateData(musician),
    });
    return mapMusician(row);
  } catch {
    return null;
  }
}

export async function deleteBandMusician(id: string): Promise<boolean> {
  try {
    await prisma.bandMusician.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function resetMusicStore(): Promise<void> {
  await prisma.$transaction([
    prisma.serviceMusicPlan.deleteMany(),
    prisma.choirScheduleOverride.deleteMany(),
    prisma.bandMusician.deleteMany(),
    prisma.song.deleteMany(),
  ]);

  const store = MUSIC_SEED;
  for (const song of store.songs) {
    await prisma.song.create({ data: { ...song, themes: song.themes } });
  }
  for (const plan of store.plans) {
    await prisma.serviceMusicPlan.create({
      data: {
        ...plan,
        scheduleOverride: plan.scheduleOverride ?? false,
        sentAt: plan.sentAt ? new Date(plan.sentAt) : null,
        songs: plan.songs,
      },
    });
  }
  for (const override of store.scheduleOverrides ?? []) {
    await prisma.choirScheduleOverride.create({ data: override });
  }
  for (const musician of store.bandRoster ?? []) {
    await prisma.bandMusician.create({
      data: musicianCreateData({
        ...musician,
        playerType: musician.playerType ?? 'regular',
      }),
    });
  }
}
