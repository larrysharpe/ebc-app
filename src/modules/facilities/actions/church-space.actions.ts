'use server';

import { revalidatePath } from 'next/cache';

import { updateChurchSpaceSchema } from '@/modules/facilities/schemas/church-space.schemas';
import {
  listChurchSpaceOptions,
  listManagedChurchSpaces,
  updateManagedChurchSpace,
} from '@/modules/facilities/services/church-space.service';
import type {
  ChurchSpace,
  ChurchSpaceOption,
} from '@/modules/facilities/types/church-space.types';

export type ChurchSpaceActionResult =
  | { ok: true; space: ChurchSpace }
  | { ok: false; error: string };

export async function listChurchSpaceOptionsAction(): Promise<ChurchSpaceOption[]> {
  try {
    return await listChurchSpaceOptions();
  } catch {
    return [];
  }
}

export async function listManagedChurchSpacesAction(): Promise<
  { ok: true; spaces: ChurchSpace[] } | { ok: false; error: string }
> {
  try {
    const spaces = await listManagedChurchSpaces();
    return { ok: true, spaces };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not load spaces.',
    };
  }
}

export async function updateChurchSpaceAction(
  id: string,
  raw: unknown,
): Promise<ChurchSpaceActionResult> {
  const parsed = updateChurchSpaceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  try {
    const space = await updateManagedChurchSpace(id, parsed.data);
    revalidatePath('/facilities');
    return { ok: true, space };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not update space.',
    };
  }
}
