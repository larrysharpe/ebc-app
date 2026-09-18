'use server';

import { revalidatePath } from 'next/cache';

import {
  PermissionDeniedError,
  requirePermission,
} from '@/modules/auth/services/auth.service';
import {
  bandMusicianIdSchema,
  bandMusicianInputSchema,
  type BandMusicianInput,
} from '@/modules/music/schemas/band-roster.schemas';
import { listPeople } from '@/modules/members/repositories/person.repository';
import { personDisplayName } from '@/modules/members/types/person.types';
import {
  createBandMusician,
  deleteBandMusician,
  getBandMusicianById,
  updateBandMusician,
} from '@/modules/music/repository/music.repository';
import type { BandMusician } from '@/modules/music/types';

function revalidateBandPaths(): void {
  revalidatePath('/');
  revalidatePath('/music');
  revalidatePath('/music/band');
}

async function guardBandManage(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requirePermission('music.band.manage');
    return { ok: true };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return { ok: false, error: 'You do not have permission to manage the band roster.' };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

function toBandMusician(input: BandMusicianInput, existingId?: string): BandMusician {
  const isGuest = input.playerType === 'guest';

  const secondaryInstruments = (input.secondaryInstruments ?? []).filter(
    (instrument) => instrument !== input.instrument,
  );

  return {
    id: existingId ?? input.id ?? `musician-${Date.now()}`,
    name: input.name,
    personId: input.personId,
    instrument: input.instrument,
    secondaryInstruments,
    playerType: input.playerType,
    guestServiceDate: isGuest ? input.guestServiceDate : undefined,
    sundays: isGuest ? undefined : input.sundays,
    everyOther2nd: isGuest ? false : (input.everyOther2nd ?? false),
    role: input.role,
    depthOrder: input.depthOrder ?? 0,
    namePending: input.namePending ?? false,
    notes: input.notes,
  };
}

export async function saveBandMusicianAction(input: BandMusicianInput) {
  const allowed = await guardBandManage();
  if (!allowed.ok) return allowed;

  const parsed = bandMusicianInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid musician details.',
    };
  }

  const data = parsed.data;
  const existing = data.id ? await getBandMusicianById(data.id) : undefined;
  let musician = toBandMusician(data, existing?.id);

  if (musician.personId) {
    const people = await listPeople({ limit: 500 });
    const person = people.find((row) => row.id === musician.personId);
    if (person) {
      musician = { ...musician, name: personDisplayName(person) };
    }
  }

  const saved = existing
    ? await updateBandMusician(musician)
    : await createBandMusician(musician);

  if (!saved) {
    return { ok: false as const, error: 'Could not save musician.' };
  }

  revalidateBandPaths();
  return { ok: true as const, musician: saved };
}

export async function deleteBandMusicianAction(id: string) {
  const allowed = await guardBandManage();
  if (!allowed.ok) return allowed;

  const parsed = bandMusicianIdSchema.safeParse({ id });
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid musician id.' };
  }

  const deleted = await deleteBandMusician(parsed.data.id);
  if (!deleted) {
    return { ok: false as const, error: 'Musician not found.' };
  }

  revalidateBandPaths();
  return { ok: true as const };
}
