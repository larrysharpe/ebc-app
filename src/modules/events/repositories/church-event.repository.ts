import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';

import type { ActivityRequest } from '../types/activity-request.types';
import type {
  ChurchEvent,
  ChurchEventStatus,
  ChurchEventType,
} from '../types/church-event.types';

type ChurchEventRow = {
  id: string;
  title: string;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  spaceId: string | null;
  notes: string | null;
  recurring: string | null;
  recurrencePattern: string | null;
  seriesId: string | null;
  eventType: string;
  status: string;
  activityRequest: Prisma.JsonValue | null;
  ministryId: string | null;
  ministry?: { name: string } | null;
};

function parseActivityRequest(
  value: Prisma.JsonValue | null | undefined,
): ActivityRequest | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  return value as unknown as ActivityRequest;
}

function mapRow(row: ChurchEventRow): ChurchEvent {
  return {
    id: row.id,
    title: row.title,
    eventDate: row.eventDate ?? undefined,
    startTime: row.startTime ?? undefined,
    endTime: row.endTime ?? undefined,
    location: row.location ?? undefined,
    spaceId: row.spaceId ?? undefined,
    notes: row.notes ?? undefined,
    recurring: row.recurring ?? undefined,
    recurrencePattern: row.recurrencePattern ?? undefined,
    seriesId: row.seriesId ?? undefined,
    eventType: row.eventType as ChurchEventType,
    status: row.status as ChurchEventStatus,
    activityRequest: parseActivityRequest(row.activityRequest),
    ministryId: row.ministryId ?? undefined,
    ministryName: row.ministry?.name,
  };
}

const ACTIVE_STATUSES: ChurchEventStatus[] = [
  'scheduled',
  'draft',
  'pending_approval',
];

export async function listChurchEvents(options?: {
  fromDate?: string;
  ministryId?: string;
  /** When true with ministryId, also include church-wide events. */
  includeChurchWide?: boolean;
  includeCancelled?: boolean;
}): Promise<ChurchEvent[]> {
  const fromDate = options?.fromDate ?? new Date().toISOString().slice(0, 10);
  const ministryFilter = options?.ministryId
    ? options.includeChurchWide
      ? { OR: [{ ministryId: options.ministryId }, { ministryId: null }] }
      : { ministryId: options.ministryId }
    : {};

  const rows = await prisma.churchEvent.findMany({
    where: {
      OR: [{ eventDate: { gte: fromDate } }, { eventDate: null }],
      ...(options?.includeCancelled
        ? {}
        : { status: { in: ACTIVE_STATUSES } }),
      ...ministryFilter,
    },
    include: { ministry: { select: { name: true } } },
    orderBy: [
      { eventDate: { sort: 'asc', nulls: 'first' } },
      { startTime: 'asc' },
    ],
  });
  return rows.map(mapRow);
}

/**
 * Candidates for room conflict checks — same space id or legacy matching location label.
 */
export async function listChurchEventsForSpaceConflict(options: {
  spaceId: string;
  locationLabel?: string;
  dates: readonly string[];
}): Promise<ChurchEvent[]> {
  if (options.dates.length === 0) return [];

  const locationOr =
    options.locationLabel?.trim()
      ? [{ spaceId: options.spaceId }, { location: options.locationLabel.trim() }]
      : [{ spaceId: options.spaceId }];

  const rows = await prisma.churchEvent.findMany({
    where: {
      eventDate: { in: [...options.dates] },
      status: { in: ACTIVE_STATUSES },
      OR: locationOr,
    },
    include: { ministry: { select: { name: true } } },
    orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
  });
  return rows.map(mapRow);
}

export async function getChurchEventById(id: string): Promise<ChurchEvent | null> {
  const row = await prisma.churchEvent.findUnique({
    where: { id },
    include: { ministry: { select: { name: true } } },
  });
  return row ? mapRow(row) : null;
}

type ChurchEventWriteInput = Omit<ChurchEvent, 'id' | 'ministryName'> & {
  id?: string;
};

function toCreateData(input: ChurchEventWriteInput) {
  return {
    id: input.id ?? `evt-${crypto.randomUUID().slice(0, 8)}`,
    title: input.title,
    eventDate: input.eventDate ?? null,
    startTime: input.startTime ?? null,
    endTime: input.endTime ?? null,
    location: input.location ?? null,
    spaceId: input.spaceId ?? null,
    notes: input.notes ?? null,
    recurring: input.recurring ?? null,
    recurrencePattern: input.recurrencePattern ?? null,
    seriesId: input.seriesId ?? null,
    eventType: input.eventType,
    status: input.status,
    activityRequest: input.activityRequest
      ? (input.activityRequest as unknown as Prisma.InputJsonValue)
      : undefined,
    ministryId: input.ministryId ?? null,
  };
}

export async function createChurchEvent(
  input: ChurchEventWriteInput,
): Promise<ChurchEvent> {
  const row = await prisma.churchEvent.create({
    data: toCreateData(input),
    include: { ministry: { select: { name: true } } },
  });
  return mapRow(row);
}

export async function createChurchEvents(
  inputs: ChurchEventWriteInput[],
): Promise<ChurchEvent[]> {
  if (inputs.length === 0) return [];
  const prepared = inputs.map((input) => ({
    ...input,
    id: input.id ?? `evt-${crypto.randomUUID().slice(0, 8)}`,
  }));
  await prisma.churchEvent.createMany({
    data: prepared.map((input) => toCreateData(input)),
  });
  const ids = prepared.map((input) => input.id);
  const rows = await prisma.churchEvent.findMany({
    where: { id: { in: ids } },
    include: { ministry: { select: { name: true } } },
    orderBy: [{ eventDate: { sort: 'asc', nulls: 'first' } }, { startTime: 'asc' }],
  });
  return rows.map(mapRow);
}

export async function updateChurchEvent(
  id: string,
  input: Omit<ChurchEvent, 'id' | 'ministryName'>,
): Promise<ChurchEvent | null> {
  try {
    const row = await prisma.churchEvent.update({
      where: { id },
      data: {
        title: input.title,
        eventDate: input.eventDate ?? null,
        startTime: input.startTime ?? null,
        endTime: input.endTime ?? null,
        location: input.location ?? null,
        spaceId: input.spaceId ?? null,
        notes: input.notes ?? null,
        recurring: input.recurring ?? null,
        recurrencePattern: input.recurrencePattern ?? null,
        seriesId: input.seriesId ?? null,
        eventType: input.eventType,
        status: input.status,
        activityRequest:
          input.activityRequest === undefined
            ? undefined
            : (input.activityRequest as unknown as Prisma.InputJsonValue),
        ministryId: input.ministryId ?? null,
      },
      include: { ministry: { select: { name: true } } },
    });
    return mapRow(row);
  } catch {
    return null;
  }
}

export async function deleteChurchEvent(id: string): Promise<boolean> {
  try {
    await prisma.churchEvent.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
