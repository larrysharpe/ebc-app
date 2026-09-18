import { prisma } from '@/lib/db';

import type {
  ServiceCharacteristic,
  SundayService,
  SundayServiceStatus,
} from '../types/sunday-service.types';
import { mergeServiceCharacteristics } from '../utils/sunday-service-characteristic.utils';

function mapRow(row: {
  id: string;
  serviceDate: string;
  title: string;
  characteristics: string[];
  notes: string | null;
  startTime: string | null;
  endTime: string | null;
  status: string;
}): SundayService {
  return {
    id: row.id,
    serviceDate: row.serviceDate,
    title: row.title,
    characteristics: row.characteristics as ServiceCharacteristic[],
    notes: row.notes ?? undefined,
    startTime: row.startTime ?? undefined,
    endTime: row.endTime ?? undefined,
    status: row.status as SundayServiceStatus,
  };
}

export async function listSundayServices(options?: {
  fromDate?: string;
  includeCancelled?: boolean;
}): Promise<SundayService[]> {
  const fromDate = options?.fromDate ?? new Date().toISOString().slice(0, 10);
  const rows = await prisma.sundayService.findMany({
    where: {
      serviceDate: { gte: fromDate },
      ...(options?.includeCancelled ? {} : { status: 'scheduled' }),
    },
    orderBy: { serviceDate: 'asc' },
  });
  return rows.map(mapRow);
}

export async function listUpcomingSundayServices(
  limit = 16,
): Promise<SundayService[]> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await prisma.sundayService.findMany({
    where: { serviceDate: { gte: today }, status: 'scheduled' },
    orderBy: { serviceDate: 'asc' },
    take: limit,
  });
  return rows.map(mapRow);
}

export async function getSundayServiceById(
  id: string,
): Promise<SundayService | null> {
  const row = await prisma.sundayService.findUnique({ where: { id } });
  return row ? mapRow(row) : null;
}

export async function getSundayServiceByDate(
  serviceDate: string,
): Promise<SundayService | null> {
  const row = await prisma.sundayService.findFirst({
    where: { serviceDate, status: 'scheduled' },
    orderBy: { updatedAt: 'desc' },
  });
  return row ? mapRow(row) : null;
}

/** Merge WP ordinance tags onto the Sunday service for that date. */
export async function mergeSundayServiceCharacteristics(input: {
  serviceDate: string;
  characteristics: ServiceCharacteristic[];
  notes?: string;
}): Promise<SundayService> {
  const existing = await getSundayServiceByDate(input.serviceDate);
  if (existing) {
    const characteristics = mergeServiceCharacteristics(
      existing.characteristics,
      input.characteristics,
    );
    const notes =
      existing.notes && input.notes && !existing.notes.includes(input.notes)
        ? `${existing.notes}\n${input.notes}`
        : existing.notes ?? input.notes;
    const updated = await updateSundayService(existing.id, {
      ...existing,
      characteristics,
      notes,
    });
    if (updated) return updated;
    return existing;
  }

  return createSundayService({
    serviceDate: input.serviceDate,
    title: '',
    characteristics: input.characteristics,
    notes: input.notes,
    status: 'scheduled',
  });
}

export async function createSundayService(
  input: Omit<SundayService, 'id'> & { id?: string },
): Promise<SundayService> {
  const row = await prisma.sundayService.create({
    data: {
      id: input.id ?? `svc-${crypto.randomUUID().slice(0, 8)}`,
      serviceDate: input.serviceDate,
      title: input.title,
      characteristics: input.characteristics,
      notes: input.notes ?? null,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
      status: input.status,
    },
  });
  return mapRow(row);
}

export async function updateSundayService(
  id: string,
  input: Omit<SundayService, 'id'>,
): Promise<SundayService | null> {
  try {
    const row = await prisma.sundayService.update({
      where: { id },
      data: {
        serviceDate: input.serviceDate,
        title: input.title,
        characteristics: input.characteristics,
        notes: input.notes ?? null,
        startTime: input.startTime ?? null,
        endTime: input.endTime ?? null,
        status: input.status,
      },
    });
    return mapRow(row);
  } catch {
    return null;
  }
}

export async function deleteSundayService(id: string): Promise<boolean> {
  try {
    await prisma.sundayService.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
