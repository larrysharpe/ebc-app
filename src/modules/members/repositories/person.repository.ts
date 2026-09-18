import { prisma } from '@/lib/db';

import { PEOPLE_SEED } from '../data/people.seed';
import type { MembershipStatus, Person } from '../types';
import { buildSeedPersonEmail } from '../utils/person-seed-email.utils';

async function ensurePeopleSeed(): Promise<void> {
  const ids = PEOPLE_SEED.map((person) => person.id);
  const existing = await prisma.person.findMany({
    where: { id: { in: ids } },
    select: { id: true, email: true },
  });
  const existingById = new Map(existing.map((row) => [row.id, row]));

  for (const person of PEOPLE_SEED) {
    const current = existingById.get(person.id);
    if (!current) {
      await prisma.person.create({
        data: {
          id: person.id,
          firstName: person.firstName,
          lastName: person.lastName,
          suffix: person.suffix ?? null,
          email: person.email ?? null,
          phone: person.phone ?? null,
          dateOfBirth: person.dateOfBirth ?? null,
          isMinor: person.isMinor ?? false,
          membershipStatus: person.membershipStatus,
          notes: person.notes ?? null,
        },
      });
      continue;
    }

    // Backfill seed emails onto existing rows so Music People / roles can link logins.
    if (!current.email && person.email) {
      await prisma.person.update({
        where: { id: person.id },
        data: { email: person.email },
      });
    }
  }

  await backfillMissingPersonEmails();
}

/** Ensure every directory person has an email (required for music / app role assignment). */
async function backfillMissingPersonEmails(): Promise<void> {
  const people = await prisma.person.findMany({
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  const taken = new Set(
    people
      .map((person) => person.email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email)),
  );

  for (const person of people) {
    if (person.email?.trim()) continue;
    const email = buildSeedPersonEmail({
      firstName: person.firstName,
      lastName: person.lastName,
      id: person.id,
      takenEmails: taken,
    });
    await prisma.person.update({
      where: { id: person.id },
      data: { email },
    });
    taken.add(email.toLowerCase());
  }
}

function mapPerson(row: {
  id: string;
  firstName: string;
  lastName: string;
  suffix: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  isMinor: boolean;
  membershipStatus: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Person {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    suffix: row.suffix ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    dateOfBirth: row.dateOfBirth ?? undefined,
    isMinor: row.isMinor,
    membershipStatus: row.membershipStatus as MembershipStatus,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function peopleWhere(input?: {
  query?: string;
  membershipStatus?: MembershipStatus;
}) {
  const query = input?.query?.trim();
  return {
    ...(input?.membershipStatus
      ? { membershipStatus: input.membershipStatus }
      : {}),
    ...(query
      ? {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' as const } },
            { lastName: { contains: query, mode: 'insensitive' as const } },
            { suffix: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
            { phone: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
}

export async function listPeople(input?: {
  query?: string;
  membershipStatus?: MembershipStatus;
  limit?: number;
}): Promise<Person[]> {
  await ensurePeopleSeed();
  const limit = input?.limit ?? 100;

  const rows = await prisma.person.findMany({
    where: peopleWhere(input),
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: limit,
  });

  return rows.map(mapPerson);
}

export async function listPeoplePage(input?: {
  query?: string;
  membershipStatus?: MembershipStatus;
  page?: number;
  pageSize?: number;
  sort?: 'lastName' | 'firstName' | 'status';
  dir?: 'asc' | 'desc';
}): Promise<{ people: Person[]; total: number }> {
  await ensurePeopleSeed();
  const pageSize = Math.max(1, input?.pageSize ?? 25);
  const page = Math.max(1, input?.page ?? 1);
  const where = peopleWhere(input);
  const dir = input?.dir === 'desc' ? ('desc' as const) : ('asc' as const);
  const orderBy =
    input?.sort === 'firstName'
      ? [{ firstName: dir }, { lastName: 'asc' as const }]
      : input?.sort === 'status'
        ? [{ membershipStatus: dir }, { lastName: 'asc' as const }]
        : [{ lastName: dir }, { firstName: 'asc' as const }];

  const [total, rows] = await prisma.$transaction([
    prisma.person.count({ where }),
    prisma.person.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { people: rows.map(mapPerson), total };
}

export async function getPersonById(id: string): Promise<Person | null> {
  const row = await prisma.person.findUnique({ where: { id } });
  return row ? mapPerson(row) : null;
}

export async function getPersonByEmail(
  email: string,
): Promise<Person | null> {
  await ensurePeopleSeed();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const row = await prisma.person.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
  });
  return row ? mapPerson(row) : null;
}

export async function getPeopleByIds(ids: string[]): Promise<Person[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.person.findMany({
    where: { id: { in: ids } },
  });
  return rows.map(mapPerson);
}

export async function createPerson(
  person: Omit<Person, 'createdAt' | 'updatedAt'>,
): Promise<Person> {
  const row = await prisma.person.create({
    data: {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      suffix: person.suffix ?? null,
      email: person.email ?? null,
      phone: person.phone ?? null,
      dateOfBirth: person.dateOfBirth ?? null,
      isMinor: person.isMinor ?? false,
      membershipStatus: person.membershipStatus,
      notes: person.notes ?? null,
    },
  });
  return mapPerson(row);
}

export async function upsertPerson(
  person: Omit<Person, 'createdAt' | 'updatedAt'>,
): Promise<Person> {
  const row = await prisma.person.upsert({
    where: { id: person.id },
    create: {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      suffix: person.suffix ?? null,
      email: person.email ?? null,
      phone: person.phone ?? null,
      dateOfBirth: person.dateOfBirth ?? null,
      isMinor: person.isMinor ?? false,
      membershipStatus: person.membershipStatus,
      notes: person.notes ?? null,
    },
    update: {
      firstName: person.firstName,
      lastName: person.lastName,
      suffix: person.suffix ?? null,
      email: person.email ?? null,
      phone: person.phone ?? null,
      dateOfBirth: person.dateOfBirth ?? null,
      isMinor: person.isMinor ?? false,
      membershipStatus: person.membershipStatus,
      notes: person.notes ?? null,
    },
  });
  return mapPerson(row);
}

export async function updatePerson(
  person: Omit<Person, 'createdAt' | 'updatedAt'>,
): Promise<Person | null> {
  try {
    const row = await prisma.person.update({
      where: { id: person.id },
      data: {
        firstName: person.firstName,
        lastName: person.lastName,
        suffix: person.suffix ?? null,
        email: person.email ?? null,
        phone: person.phone ?? null,
        dateOfBirth: person.dateOfBirth ?? null,
        isMinor: person.isMinor ?? false,
        membershipStatus: person.membershipStatus,
        notes: person.notes ?? null,
      },
    });
    return mapPerson(row);
  } catch {
    return null;
  }
}

export async function deletePerson(id: string): Promise<boolean> {
  try {
    await prisma.person.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
