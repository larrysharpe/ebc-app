import { getSession } from '@/modules/auth/services/auth.service';
import { CHURCH_SPACES_SEED } from '@/modules/facilities/constants/church-space.constants';
import {
  getChurchSpaceById,
  listChurchSpaces,
  updateChurchSpace,
  upsertChurchSpaceSeed,
} from '@/modules/facilities/repositories/church-space.repository';
import type {
  ChurchSpace,
  ChurchSpaceOption,
  UpdateChurchSpaceInput,
} from '@/modules/facilities/types/church-space.types';
import { canManageFacilities } from '@/modules/facilities/utils/facilities-access.utils';
import { toChurchSpaceOption } from '@/modules/facilities/utils/church-space.utils';

export async function ensureChurchSpacesSeeded(): Promise<void> {
  for (const seed of CHURCH_SPACES_SEED) {
    await upsertChurchSpaceSeed(seed);
  }
}

export async function listChurchSpaceOptions(): Promise<ChurchSpaceOption[]> {
  let spaces = await listChurchSpaces({ activeOnly: true });
  if (spaces.length === 0) {
    await ensureChurchSpacesSeeded();
    spaces = await listChurchSpaces({ activeOnly: true });
  }
  return spaces.map(toChurchSpaceOption);
}

export async function listManagedChurchSpaces(): Promise<ChurchSpace[]> {
  const session = await getSession();
  if (!session || !canManageFacilities(session.roles)) {
    throw new Error('You do not have permission to manage facilities.');
  }

  let spaces = await listChurchSpaces();
  if (spaces.length === 0) {
    await ensureChurchSpacesSeeded();
    spaces = await listChurchSpaces();
  }
  return spaces;
}

export async function updateManagedChurchSpace(
  id: string,
  input: UpdateChurchSpaceInput,
): Promise<ChurchSpace> {
  const session = await getSession();
  if (!session || !canManageFacilities(session.roles)) {
    throw new Error('You do not have permission to manage facilities.');
  }

  const existing = await getChurchSpaceById(id);
  if (!existing) {
    throw new Error('Space not found.');
  }

  const updated = await updateChurchSpace(id, input);
  if (!updated) {
    throw new Error('Could not update space.');
  }
  return updated;
}
