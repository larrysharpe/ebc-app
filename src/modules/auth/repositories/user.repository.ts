import { prisma } from '@/lib/db';
import type { AuthUserRecord, UserStatus, StoredUserRole } from '@/modules/auth/types/auth.types';
import { normalizeRoles } from '@/modules/auth/utils/roles.utils';

type UserRow = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  roles: string[];
  ministryIds: string[];
  choirIds: string[];
  status: string;
};

function toAuthUser(row: UserRow): AuthUserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    roles: normalizeRoles(row.roles as StoredUserRole[]),
    status: row.status as UserStatus,
    ministryIds: row.ministryIds,
    choirIds: row.choirIds,
  };
}

export async function findUserByEmail(
  email: string,
): Promise<AuthUserRecord | null> {
  const row = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return row ? toAuthUser(row) : null;
}

export async function findUsersByEmails(
  emails: string[],
): Promise<AuthUserRecord[]> {
  const normalized = [
    ...new Set(
      emails
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  if (normalized.length === 0) return [];

  const rows = await prisma.user.findMany({
    where: { email: { in: normalized } },
  });
  return rows.map(toAuthUser);
}

export async function findUserById(id: string): Promise<AuthUserRecord | null> {
  const row = await prisma.user.findUnique({ where: { id } });
  return row ? toAuthUser(row) : null;
}

export async function listUsers(): Promise<AuthUserRecord[]> {
  const rows = await prisma.user.findMany({ orderBy: { name: 'asc' } });
  return rows.map(toAuthUser);
}

export async function createUserRecord(data: {
  email: string;
  name: string;
  roles: string[];
  ministryIds: string[];
  choirIds: string[];
  passwordHash: string;
  status: string;
}): Promise<AuthUserRecord> {
  const row = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      roles: data.roles,
      ministryIds: data.ministryIds,
      choirIds: data.choirIds,
      passwordHash: data.passwordHash,
      status: data.status,
    },
  });
  return toAuthUser(row);
}

export async function updateUserRecord(
  id: string,
  data: {
    name: string;
    roles: string[];
    ministryIds: string[];
    choirIds: string[];
    passwordHash?: string;
    status: string;
  },
): Promise<AuthUserRecord | null> {
  try {
    const row = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        roles: data.roles,
        ministryIds: data.ministryIds,
        choirIds: data.choirIds,
        status: data.status,
        ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
      },
    });
    return toAuthUser(row);
  } catch {
    return null;
  }
}
