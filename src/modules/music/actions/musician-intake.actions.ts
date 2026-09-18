'use server';

import { revalidatePath } from 'next/cache';

import {
  PermissionDeniedError,
  requirePermission,
  requireSession,
} from '@/modules/auth/services/auth.service';
import {
  musicianIntakeIdSchema,
  musicianIntakeInputSchema,
  type MusicianIntakeInput,
} from '@/modules/music/schemas/musician-intake.schemas';
import {
  createMusicianIntake,
  deleteMusicianIntake,
  getMusicianIntakeById,
  updateMusicianIntake,
} from '@/modules/music/repository/musician-intake.repository';
import { createBandMusician } from '@/modules/music/repository/music.repository';
import type { BandMusician } from '@/modules/music/types';
import type { MusicianIntake } from '@/modules/music/types/musician-intake.types';

function revalidateIntakePaths(): void {
  revalidatePath('/music');
  revalidatePath('/music/musician-intake');
  revalidatePath('/music/band');
}

async function guardIntakeManage(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    await requirePermission('music.intake.manage');
    return { ok: true };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return {
        ok: false,
        error: 'You do not have permission to manage musician intake.',
      };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

export async function saveMusicianIntakeAction(input: MusicianIntakeInput) {
  const allowed = await guardIntakeManage();
  if (!allowed.ok) return allowed;

  const parsed = musicianIntakeInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid intake details.',
    };
  }

  const session = await requireSession();
  const data = parsed.data;
  const existing = data.id ? await getMusicianIntakeById(data.id) : undefined;

  const intake: MusicianIntake = {
    id: existing?.id ?? `intake-${Date.now()}`,
    name: data.name,
    email: data.email || undefined,
    phone: data.phone || undefined,
    instrument: data.instrument,
    serviceDate: data.serviceDate,
    playerType: data.playerType,
    paymentPaperworkComplete: data.paymentPaperworkComplete,
    paymentNotes: data.paymentNotes,
    status: existing?.status ?? 'pending',
    bandMusicianId: existing?.bandMusicianId,
    createdByUserId: existing?.createdByUserId ?? session.id,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saved = existing
    ? await updateMusicianIntake(intake)
    : await createMusicianIntake(intake);

  if (!saved) {
    return { ok: false as const, error: 'Could not save intake.' };
  }

  revalidateIntakePaths();
  return { ok: true as const, intake: saved };
}

export async function addIntakeToRosterAction(input: { id: string }) {
  const allowed = await guardIntakeManage();
  if (!allowed.ok) return allowed;

  const parsed = musicianIntakeIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid intake.' };
  }

  const intake = await getMusicianIntakeById(parsed.data.id);
  if (!intake) {
    return { ok: false as const, error: 'Intake not found.' };
  }
  if (intake.status === 'rostered' && intake.bandMusicianId) {
    return { ok: false as const, error: 'Already added to the band roster.' };
  }
  if (!intake.paymentPaperworkComplete) {
    return {
      ok: false as const,
      error: 'Mark payment paperwork complete before adding to the roster.',
    };
  }

  const isGuest = intake.playerType === 'guest';
  const musician: BandMusician = {
    id: `musician-${Date.now()}`,
    name: intake.name,
    instrument: intake.instrument,
    secondaryInstruments: [],
    playerType: intake.playerType,
    guestServiceDate: isGuest ? intake.serviceDate : undefined,
    sundays: isGuest ? undefined : [],
    everyOther2nd: false,
    role: isGuest ? 'special' : 'backup',
    depthOrder: 0,
    notes: intake.paymentNotes
      ? `From intake · ${intake.paymentNotes}`
      : 'From musician intake',
  };

  const created = await createBandMusician(musician);
  const updated = await updateMusicianIntake({
    ...intake,
    status: 'rostered',
    bandMusicianId: created.id,
    updatedAt: new Date().toISOString(),
  });

  if (!updated) {
    return { ok: false as const, error: 'Rostered, but could not update intake status.' };
  }

  revalidateIntakePaths();
  return { ok: true as const, intake: updated, musician: created };
}

export async function declineMusicianIntakeAction(input: { id: string }) {
  const allowed = await guardIntakeManage();
  if (!allowed.ok) return allowed;

  const parsed = musicianIntakeIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid intake.' };
  }

  const intake = await getMusicianIntakeById(parsed.data.id);
  if (!intake) {
    return { ok: false as const, error: 'Intake not found.' };
  }

  const updated = await updateMusicianIntake({
    ...intake,
    status: 'declined',
    updatedAt: new Date().toISOString(),
  });

  if (!updated) {
    return { ok: false as const, error: 'Could not update intake.' };
  }

  revalidateIntakePaths();
  return { ok: true as const, intake: updated };
}

export async function deleteMusicianIntakeAction(input: { id: string }) {
  const allowed = await guardIntakeManage();
  if (!allowed.ok) return allowed;

  const parsed = musicianIntakeIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid intake.' };
  }

  const deleted = await deleteMusicianIntake(parsed.data.id);
  if (!deleted) {
    return { ok: false as const, error: 'Could not delete intake.' };
  }

  revalidateIntakePaths();
  return { ok: true as const };
}
