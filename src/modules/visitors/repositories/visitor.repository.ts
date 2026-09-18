import { prisma } from '@/lib/db';

import type { CreateVisitorInput, Visitor, VisitorStatus } from '../types/visitor.types';

function mapVisitor(row: {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  visitDate: string;
  howHeard: string | null;
  followUpNotes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): Visitor {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    visitDate: row.visitDate,
    howHeard: row.howHeard ?? undefined,
    followUpNotes: row.followUpNotes ?? undefined,
    status: row.status as VisitorStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listVisitors(): Promise<Visitor[]> {
  const rows = await prisma.visitor.findMany({
    orderBy: [{ visitDate: 'desc' }, { createdAt: 'desc' }],
  });
  return rows.map(mapVisitor);
}

export async function createVisitor(input: CreateVisitorInput): Promise<Visitor> {
  const row = await prisma.visitor.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      visitDate: input.visitDate,
      howHeard: input.howHeard?.trim() || null,
      followUpNotes: input.followUpNotes?.trim() || null,
      status: 'new',
    },
  });
  return mapVisitor(row);
}

export async function updateVisitorStatus(
  id: string,
  status: VisitorStatus,
): Promise<Visitor | null> {
  try {
    const row = await prisma.visitor.update({
      where: { id },
      data: { status },
    });
    return mapVisitor(row);
  } catch {
    return null;
  }
}
