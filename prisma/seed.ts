import { readFile } from 'fs/promises';
import path from 'path';

import { PrismaClient } from '@prisma/client';

import { SOP_CONFIG_SEED } from '../src/modules/leadership/data/sop-config.seed';
import { MINISTRIES_SEED } from '../src/modules/ministries/data/ministries.seed';
import { mergeWebsiteSops } from '../src/modules/ministries/data/website-sops';
import { MUSIC_SEED } from '../src/modules/music/data/music.seed';
import {
  DEV_SEED_PASSWORD,
  DEV_SEED_USERS,
} from '../src/modules/auth/data/users.seed';
import { hashPassword } from '../src/modules/auth/utils/password.utils';
import { CHURCH_SPACES_SEED } from '../src/modules/facilities/constants/church-space.constants';
import { PEOPLE_SEED } from '../src/modules/members/data/people.seed';
import { upsertChurchPerson } from '../src/modules/members/services/person.service';
import type { Ministry } from '../src/modules/ministries/types';
import type { MusicStore } from '../src/modules/music/types';
import type { SopConfigStore } from '../src/modules/leadership/types';

const prisma = new PrismaClient();

async function loadLegacyJson<T>(filename: string): Promise<T | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), '.data', filename), 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function ministriesWithWebsiteSops(ministries: Ministry[]): Ministry[] {
  return ministries.map((ministry) => ({
    ...ministry,
    sops: mergeWebsiteSops(ministry.sops, ministry.slug),
  }));
}

async function seedMinistries(ministries: Ministry[]) {
  for (const ministry of ministriesWithWebsiteSops(ministries)) {
    await prisma.ministry.upsert({
      where: { id: ministry.id },
      create: {
        id: ministry.id,
        slug: ministry.slug,
        name: ministry.name,
        category: ministry.category,
        description: ministry.description,
        websiteUrl: ministry.websiteUrl,
        meetingSummary: ministry.meetingSummary,
        contactEmail: ministry.contactEmail,
        personnel: ministry.personnel,
        events: ministry.events,
        sops: ministry.sops,
        dutyCatalog: ministry.dutyCatalog,
      },
      update: {
        slug: ministry.slug,
        name: ministry.name,
        category: ministry.category,
        description: ministry.description,
        websiteUrl: ministry.websiteUrl,
        meetingSummary: ministry.meetingSummary,
        contactEmail: ministry.contactEmail,
        personnel: ministry.personnel,
        events: ministry.events,
        sops: ministry.sops,
        dutyCatalog: ministry.dutyCatalog,
      },
    });
  }
}

async function seedSopConfig(store: SopConfigStore) {
  await prisma.sopConfig.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      sections: store.sections,
      templates: store.templates,
      categoryDefaults: store.categoryDefaults,
      minQualityScore: store.minQualityScore,
    },
    update: {
      sections: store.sections,
      templates: store.templates,
      categoryDefaults: store.categoryDefaults,
      minQualityScore: store.minQualityScore,
    },
  });
}

async function seedMusic(store: MusicStore) {
  for (const song of store.songs) {
    await prisma.song.upsert({
      where: { id: song.id },
      create: {
        id: song.id,
        title: song.title,
        artist: song.artist,
        youtubeUrl: song.youtubeUrl,
        defaultKey: song.defaultKey,
        themes: song.themes,
        notes: song.notes,
        lyricsText: song.lyricsText,
        copyrightNotes: song.copyrightNotes,
      },
      update: {
        title: song.title,
        artist: song.artist,
        youtubeUrl: song.youtubeUrl,
        defaultKey: song.defaultKey,
        themes: song.themes,
        notes: song.notes,
        lyricsText: song.lyricsText,
        copyrightNotes: song.copyrightNotes,
      },
    });
  }

  for (const plan of store.plans) {
    await prisma.serviceMusicPlan.upsert({
      where: { id: plan.id },
      create: {
        id: plan.id,
        title: plan.title,
        choirGroup: plan.choirGroup,
        serviceDate: plan.serviceDate,
        sundayOfMonth: plan.sundayOfMonth,
        scheduleOverride: plan.scheduleOverride ?? false,
        scheduleNote: plan.scheduleNote,
        practiceDate: plan.practiceDate,
        practiceStartTime: plan.practiceStartTime,
        practiceEndTime: plan.practiceEndTime,
        practiceLocation: plan.practiceLocation,
        occasion: plan.occasion,
        attire: plan.attire,
        scriptureReader: plan.scriptureReader,
        prayerLeader: plan.prayerLeader,
        directorNotes: plan.directorNotes,
        postServiceMessage: plan.postServiceMessage,
        status: plan.status,
        sentAt: plan.sentAt ? new Date(plan.sentAt) : null,
        directorName: plan.directorName,
        songs: plan.songs,
      },
      update: {
        title: plan.title,
        choirGroup: plan.choirGroup,
        serviceDate: plan.serviceDate,
        sundayOfMonth: plan.sundayOfMonth,
        scheduleOverride: plan.scheduleOverride ?? false,
        scheduleNote: plan.scheduleNote,
        practiceDate: plan.practiceDate,
        practiceStartTime: plan.practiceStartTime,
        practiceEndTime: plan.practiceEndTime,
        practiceLocation: plan.practiceLocation,
        occasion: plan.occasion,
        attire: plan.attire,
        scriptureReader: plan.scriptureReader,
        prayerLeader: plan.prayerLeader,
        directorNotes: plan.directorNotes,
        postServiceMessage: plan.postServiceMessage,
        status: plan.status,
        sentAt: plan.sentAt ? new Date(plan.sentAt) : null,
        directorName: plan.directorName,
        songs: plan.songs,
      },
    });
  }

  for (const override of store.scheduleOverrides ?? []) {
    await prisma.choirScheduleOverride.upsert({
      where: { id: override.id },
      create: {
        id: override.id,
        serviceDate: override.serviceDate,
        choirGroup: override.choirGroup,
        sundayOfMonth: override.sundayOfMonth,
        note: override.note,
      },
      update: {
        serviceDate: override.serviceDate,
        choirGroup: override.choirGroup,
        sundayOfMonth: override.sundayOfMonth,
        note: override.note,
      },
    });
  }

  for (const musician of store.bandRoster ?? []) {
    await prisma.bandMusician.upsert({
      where: { id: musician.id },
      create: {
        id: musician.id,
        name: musician.name,
        instrument: musician.instrument,
        playerType: musician.playerType ?? 'regular',
        guestServiceDate: musician.guestServiceDate ?? null,
        sundays: musician.sundays ?? [],
        everyOther2nd: musician.everyOther2nd ?? false,
        role: musician.role,
        namePending: musician.namePending ?? false,
        notes: musician.notes,
      },
      update: {
        name: musician.name,
        instrument: musician.instrument,
        playerType: musician.playerType ?? 'regular',
        guestServiceDate: musician.guestServiceDate ?? null,
        sundays: musician.sundays ?? [],
        everyOther2nd: musician.everyOther2nd ?? false,
        role: musician.role,
        namePending: musician.namePending ?? false,
        notes: musician.notes,
      },
    });
  }
}

async function seedUsers() {
  const passwordHash = await hashPassword(DEV_SEED_PASSWORD);

  for (const user of DEV_SEED_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        name: user.name,
        roles: user.roles,
        ministryIds: user.ministryIds ?? [],
        choirIds: user.choirIds ?? [],
        passwordHash,
        status: 'active',
      },
      update: {
        name: user.name,
        roles: user.roles,
        ministryIds: user.ministryIds ?? [],
        choirIds: user.choirIds ?? [],
        passwordHash,
        status: 'active',
      },
    });
  }
}

async function seedChurchSpaces(): Promise<void> {
  for (const space of CHURCH_SPACES_SEED) {
    await prisma.churchSpace.upsert({
      where: { id: space.id },
      create: {
        id: space.id,
        floor: space.floor,
        name: space.name,
        sortOrder: space.sortOrder,
        active: true,
      },
      update: {
        floor: space.floor,
        name: space.name,
        sortOrder: space.sortOrder,
      },
    });
  }
}

async function seedPeople(): Promise<void> {
  for (const person of PEOPLE_SEED) {
    await upsertChurchPerson(person);
  }
}

async function main() {
  const legacyMinistries = await loadLegacyJson<{ ministries: Ministry[] }>('ministries.json');
  const legacySop = await loadLegacyJson<SopConfigStore>('sop-config.json');
  const legacyMusic = await loadLegacyJson<MusicStore>('music.json');

  // Prefer code seed for ministries so roster/duty updates ship with the app.
  // Legacy `.data/ministries.json` is ignored when present (old file-store migration).
  if (legacyMinistries?.ministries?.length) {
    console.log(
      'Note: ignoring .data/ministries.json — using MINISTRIES_SEED from source.',
    );
  }
  await seedPeople();
  await seedMinistries(MINISTRIES_SEED);
  await seedSopConfig(legacySop ?? SOP_CONFIG_SEED);
  await seedMusic(legacyMusic ?? MUSIC_SEED);
  await seedChurchSpaces();
  await seedUsers();

  console.log('Database seeded.');
  console.log(`Church spaces: ${CHURCH_SPACES_SEED.length}`);
  console.log('Dev sign-in accounts (password: EBCDev2026!):');
  for (const user of DEV_SEED_USERS) {
    const ministryScope =
      user.ministryIds && user.ministryIds.length > 0
        ? ` · ministries: ${user.ministryIds.join(', ')}`
        : '';
    const choirScope =
      user.choirIds && user.choirIds.length > 0
        ? ` · choirs: ${user.choirIds.join(', ')}`
        : '';
    console.log(
      `  ${user.email} (${user.roles.join(', ')}${ministryScope}${choirScope})`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
