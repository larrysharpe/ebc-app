import { prisma } from '@/lib/db';

import { isChurchFloor } from '@/modules/facilities/utils/church-space.utils';
import type {
  ChurchSpace,
  UpdateChurchSpaceInput,
} from '@/modules/facilities/types/church-space.types';
import type { ChurchSpaceSeed } from '@/modules/facilities/constants/church-space.constants';

function mapSpace(row: {
  id: string;
  floor: string;
  name: string;
  sortOrder: number;
  capacity: number | null;
  notes: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ChurchSpace {
  if (!isChurchFloor(row.floor)) {
    throw new Error(`Invalid church floor: ${row.floor}`);
  }

  return {
    id: row.id,
    floor: row.floor,
    name: row.name,
    sortOrder: row.sortOrder,
    capacity: row.capacity ?? undefined,
    notes: row.notes ?? undefined,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listChurchSpaces(options?: {
  activeOnly?: boolean;
}): Promise<ChurchSpace[]> {
  const rows = await prisma.churchSpace.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: [{ floor: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  });
  return rows.map(mapSpace);
}

export async function getChurchSpaceById(id: string): Promise<ChurchSpace | null> {
  const row = await prisma.churchSpace.findUnique({ where: { id } });
  return row ? mapSpace(row) : null;
}

export async function upsertChurchSpaceSeed(seed: ChurchSpaceSeed): Promise<ChurchSpace> {
  const row = await prisma.churchSpace.upsert({
    where: { id: seed.id },
    create: {
      id: seed.id,
      floor: seed.floor,
      name: seed.name,
      sortOrder: seed.sortOrder,
      active: true,
    },
    update: {
      floor: seed.floor,
      name: seed.name,
      sortOrder: seed.sortOrder,
    },
  });
  return mapSpace(row);
}

export async function updateChurchSpace(
  id: string,
  input: UpdateChurchSpaceInput,
): Promise<ChurchSpace | null> {
  try {
    const row = await prisma.churchSpace.update({
      where: { id },
      data: {
        ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
    return mapSpace(row);
  } catch {
    return null;
  }
}
