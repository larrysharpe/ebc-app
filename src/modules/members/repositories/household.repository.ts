import { prisma } from '@/lib/db';

import type {
  Household,
  HouseholdDetail,
  HouseholdMember,
  HouseholdRole,
  MembershipStatus,
  Person,
} from '../types';

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

function mapHousehold(row: {
  id: string;
  name: string;
  primaryPhone: string | null;
  primaryEmail: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Household {
  return {
    id: row.id,
    name: row.name,
    primaryPhone: row.primaryPhone ?? undefined,
    primaryEmail: row.primaryEmail ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapMember(row: {
  id: string;
  householdId: string;
  personId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  person: Parameters<typeof mapPerson>[0];
}): HouseholdMember {
  return {
    id: row.id,
    householdId: row.householdId,
    personId: row.personId,
    role: row.role as HouseholdRole,
    person: mapPerson(row.person),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getHouseholdById(id: string): Promise<HouseholdDetail | null> {
  const row = await prisma.household.findUnique({
    where: { id },
    include: {
      members: {
        include: { person: true },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });
  if (!row) return null;
  return {
    ...mapHousehold(row),
    members: row.members.map(mapMember),
  };
}

export async function getHouseholdForPerson(
  personId: string,
): Promise<HouseholdDetail | null> {
  const membership = await prisma.personHousehold.findUnique({
    where: { personId },
    select: { householdId: true },
  });
  if (!membership) return null;
  return getHouseholdById(membership.householdId);
}

export async function createHousehold(input: {
  id: string;
  name: string;
  primaryPhone?: string;
  primaryEmail?: string;
  notes?: string;
  founder: { id: string; personId: string; role: HouseholdRole };
}): Promise<HouseholdDetail> {
  await prisma.household.create({
    data: {
      id: input.id,
      name: input.name,
      primaryPhone: input.primaryPhone ?? null,
      primaryEmail: input.primaryEmail ?? null,
      notes: input.notes ?? null,
      members: {
        create: {
          id: input.founder.id,
          personId: input.founder.personId,
          role: input.founder.role,
        },
      },
    },
  });

  const detail = await getHouseholdById(input.id);
  if (!detail) {
    throw new Error('Household created but could not be reloaded.');
  }
  return detail;
}

export async function addPersonToHousehold(input: {
  id: string;
  householdId: string;
  personId: string;
  role: HouseholdRole;
}): Promise<HouseholdDetail | null> {
  await prisma.personHousehold.create({
    data: {
      id: input.id,
      householdId: input.householdId,
      personId: input.personId,
      role: input.role,
    },
  });
  return getHouseholdById(input.householdId);
}

export async function updateHouseholdMemberRole(input: {
  personId: string;
  role: HouseholdRole;
}): Promise<HouseholdDetail | null> {
  const membership = await prisma.personHousehold.findUnique({
    where: { personId: input.personId },
  });
  if (!membership) return null;

  await prisma.personHousehold.update({
    where: { personId: input.personId },
    data: { role: input.role },
  });
  return getHouseholdById(membership.householdId);
}

export async function unlinkPersonFromHousehold(
  personId: string,
): Promise<{ householdId: string; deletedHousehold: boolean } | null> {
  const membership = await prisma.personHousehold.findUnique({
    where: { personId },
  });
  if (!membership) return null;

  await prisma.personHousehold.delete({ where: { personId } });

  const remaining = await prisma.personHousehold.count({
    where: { householdId: membership.householdId },
  });

  if (remaining === 0) {
    await prisma.household.delete({ where: { id: membership.householdId } });
    return { householdId: membership.householdId, deletedHousehold: true };
  }

  return { householdId: membership.householdId, deletedHousehold: false };
}

export async function getPersonHouseholdId(personId: string): Promise<string | null> {
  const membership = await prisma.personHousehold.findUnique({
    where: { personId },
    select: { householdId: true },
  });
  return membership?.householdId ?? null;
}
