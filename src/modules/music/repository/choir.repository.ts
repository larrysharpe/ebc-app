import { prisma } from '@/lib/db';

import type { ChoirLeader, ChoirMember, SundayOfMonth } from '../types';
import type { Choir } from '../types/choir.types';
import { DEFAULT_CHOIR_SEED } from '../types/choir.types';
import { parseChoirLeader, parseChoirMember } from '../utils/person-refs.utils';

function parseLeaders(value: unknown): ChoirLeader[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseChoirLeader)
    .filter((item): item is ChoirLeader => item !== null);
}

function parseMembers(value: unknown): ChoirMember[] {
  if (!Array.isArray(value)) return [];
  const members = value
    .map(parseChoirMember)
    .filter((item): item is ChoirMember => item !== null);
  const seen = new Set<string>();
  return members.filter((member) => {
    if (seen.has(member.personId)) return false;
    seen.add(member.personId);
    return true;
  });
}

function mapRow(row: {
  id: string;
  name: string;
  leaders: unknown;
  members: unknown;
  defaultSunday: number | null;
  sortOrder: number;
  active: boolean;
  notes: string | null;
}): Choir {
  return {
    id: row.id,
    name: row.name,
    leaders: parseLeaders(row.leaders),
    members: parseMembers(row.members),
    defaultSunday: (row.defaultSunday as SundayOfMonth | null) ?? null,
    sortOrder: row.sortOrder,
    active: row.active,
    notes: row.notes ?? undefined,
  };
}

async function ensureChoirSeed(): Promise<void> {
  for (const seed of DEFAULT_CHOIR_SEED) {
    const existing = await prisma.choir.findUnique({ where: { id: seed.id } });
    if (!existing) {
      await prisma.choir.create({
        data: {
          id: seed.id,
          name: seed.name,
          leaders: seed.leaders,
          members: seed.members,
          defaultSunday: seed.defaultSunday,
          sortOrder: seed.sortOrder,
          active: seed.active,
          notes: seed.notes ?? null,
        },
      });
      continue;
    }

    // Upgrade seed choirs still holding legacy name-based leaders
    const leaders = parseLeaders(existing.leaders);
    const needsUpgrade =
      leaders.length === 0 ||
      (Array.isArray(existing.leaders) &&
        existing.leaders.some(
          (item) =>
            item &&
            typeof item === 'object' &&
            'name' in item &&
            !('personId' in item),
        ));
    if (needsUpgrade) {
      await prisma.choir.update({
        where: { id: seed.id },
        data: { leaders: seed.leaders },
      });
    }

    // Backfill demo roster members when a seed choir still has an empty roster.
    const members = parseMembers(existing.members);
    if (members.length === 0 && seed.members.length > 0) {
      await prisma.choir.update({
        where: { id: seed.id },
        data: { members: seed.members },
      });
    }
  }
}

export async function listChoirs(options?: {
  activeOnly?: boolean;
}): Promise<Choir[]> {
  await ensureChoirSeed();
  const rows = await prisma.choir.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  return rows.map(mapRow);
}

export async function getChoirById(id: string): Promise<Choir | undefined> {
  await ensureChoirSeed();
  const row = await prisma.choir.findUnique({ where: { id } });
  return row ? mapRow(row) : undefined;
}

export async function createChoir(choir: Choir): Promise<Choir> {
  const row = await prisma.choir.create({
    data: {
      id: choir.id,
      name: choir.name,
      leaders: choir.leaders,
      members: choir.members,
      defaultSunday: choir.defaultSunday,
      sortOrder: choir.sortOrder,
      active: choir.active,
      notes: choir.notes ?? null,
    },
  });
  return mapRow(row);
}

export async function updateChoir(choir: Choir): Promise<Choir | null> {
  try {
    const row = await prisma.choir.update({
      where: { id: choir.id },
      data: {
        name: choir.name,
        leaders: choir.leaders,
        members: choir.members,
        defaultSunday: choir.defaultSunday,
        sortOrder: choir.sortOrder,
        active: choir.active,
        notes: choir.notes ?? null,
      },
    });
    return mapRow(row);
  } catch {
    return null;
  }
}

/** Clears defaultSunday on any other choir that currently owns that Sunday. */
export async function assignChoirDefaultSunday(
  choirId: string,
  sunday: SundayOfMonth | null,
): Promise<void> {
  if (sunday !== null) {
    await prisma.choir.updateMany({
      where: {
        defaultSunday: sunday,
        NOT: { id: choirId },
      },
      data: { defaultSunday: null },
    });
  }
  await prisma.choir.update({
    where: { id: choirId },
    data: { defaultSunday: sunday },
  });
}

export async function deleteChoir(id: string): Promise<boolean> {
  try {
    await prisma.choir.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function countPlansForChoir(choirId: string): Promise<number> {
  return prisma.serviceMusicPlan.count({ where: { choirGroup: choirId } });
}
