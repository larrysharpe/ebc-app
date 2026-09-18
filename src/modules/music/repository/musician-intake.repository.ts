import { prisma } from '@/lib/db';

import type { BandInstrument, BandPlayerType } from '../types';
import type {
  MusicianIntake,
  MusicianIntakeStatus,
} from '../types/musician-intake.types';

function mapRow(row: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  instrument: string;
  serviceDate: string;
  playerType: string;
  paymentPaperworkComplete: boolean;
  paymentNotes: string | null;
  status: string;
  bandMusicianId: string | null;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MusicianIntake {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    instrument: row.instrument as BandInstrument,
    serviceDate: row.serviceDate,
    playerType: row.playerType as BandPlayerType,
    paymentPaperworkComplete: row.paymentPaperworkComplete,
    paymentNotes: row.paymentNotes ?? undefined,
    status: row.status as MusicianIntakeStatus,
    bandMusicianId: row.bandMusicianId ?? undefined,
    createdByUserId: row.createdByUserId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listMusicianIntakes(): Promise<MusicianIntake[]> {
  const rows = await prisma.musicianIntake.findMany({
    orderBy: [{ serviceDate: 'desc' }, { createdAt: 'desc' }],
  });
  return rows.map(mapRow);
}

export async function getMusicianIntakeById(
  id: string,
): Promise<MusicianIntake | undefined> {
  const row = await prisma.musicianIntake.findUnique({ where: { id } });
  return row ? mapRow(row) : undefined;
}

export async function createMusicianIntake(
  intake: Omit<MusicianIntake, 'createdAt' | 'updatedAt'>,
): Promise<MusicianIntake> {
  const row = await prisma.musicianIntake.create({
    data: {
      id: intake.id,
      name: intake.name,
      email: intake.email ?? null,
      phone: intake.phone ?? null,
      instrument: intake.instrument,
      serviceDate: intake.serviceDate,
      playerType: intake.playerType,
      paymentPaperworkComplete: intake.paymentPaperworkComplete,
      paymentNotes: intake.paymentNotes ?? null,
      status: intake.status,
      bandMusicianId: intake.bandMusicianId ?? null,
      createdByUserId: intake.createdByUserId ?? null,
    },
  });
  return mapRow(row);
}

export async function updateMusicianIntake(
  intake: MusicianIntake,
): Promise<MusicianIntake | null> {
  try {
    const row = await prisma.musicianIntake.update({
      where: { id: intake.id },
      data: {
        name: intake.name,
        email: intake.email ?? null,
        phone: intake.phone ?? null,
        instrument: intake.instrument,
        serviceDate: intake.serviceDate,
        playerType: intake.playerType,
        paymentPaperworkComplete: intake.paymentPaperworkComplete,
        paymentNotes: intake.paymentNotes ?? null,
        status: intake.status,
        bandMusicianId: intake.bandMusicianId ?? null,
      },
    });
    return mapRow(row);
  } catch {
    return null;
  }
}

export async function deleteMusicianIntake(id: string): Promise<boolean> {
  try {
    await prisma.musicianIntake.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
