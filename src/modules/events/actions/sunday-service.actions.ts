'use server';

import { revalidatePath } from 'next/cache';

import {
  getSession,
  PermissionDeniedError,
} from '@/modules/auth/services/auth.service';

import {
  createSundayService,
  deleteSundayService,
  updateSundayService,
} from '../repositories/sunday-service.repository';
import { sundayServiceInputSchema } from '../schemas/sunday-service.schemas';
import type { ServiceCharacteristic, SundayService } from '../types/sunday-service.types';
import { canManageSundayServices } from '../utils/sunday-service-access.utils';

async function guardManage(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, error: 'You must be signed in.' };
    if (!canManageSundayServices(session.roles)) {
      throw new PermissionDeniedError();
    }
    return { ok: true };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return { ok: false, error: 'You do not have permission for this action.' };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

function revalidateServicePaths(): void {
  revalidatePath('/events');
  revalidatePath('/events/services');
  revalidatePath('/music');
  revalidatePath('/music/plans/new');
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function createSundayServiceAction(input: {
  serviceDate: string;
  title?: string;
  characteristics: string[];
  notes?: string;
  startTime?: string;
  endTime?: string;
}): Promise<{ ok: true; service: SundayService } | { ok: false; error: string }> {
  const allowed = await guardManage();
  if (!allowed.ok) return allowed;

  const parsed = sundayServiceInputSchema.safeParse({
    ...input,
    status: 'scheduled',
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid service.' };
  }

  if (
    parsed.data.startTime &&
    parsed.data.endTime &&
    parsed.data.endTime <= parsed.data.startTime
  ) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  const service = await createSundayService({
    serviceDate: parsed.data.serviceDate,
    title: parsed.data.title?.trim() ?? '',
    characteristics: parsed.data.characteristics as ServiceCharacteristic[],
    notes: normalizeOptional(parsed.data.notes),
    startTime: normalizeOptional(parsed.data.startTime),
    endTime: normalizeOptional(parsed.data.endTime),
    status: 'scheduled',
  });

  revalidateServicePaths();
  return { ok: true, service };
}

export async function updateSundayServiceAction(
  id: string,
  input: {
    serviceDate: string;
    title?: string;
    characteristics: string[];
    notes?: string;
    startTime?: string;
    endTime?: string;
    status: 'scheduled' | 'cancelled';
  },
): Promise<{ ok: true; service: SundayService } | { ok: false; error: string }> {
  const allowed = await guardManage();
  if (!allowed.ok) return allowed;

  const parsed = sundayServiceInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid service.' };
  }

  const service = await updateSundayService(id, {
    serviceDate: parsed.data.serviceDate,
    title: parsed.data.title?.trim() ?? '',
    characteristics: parsed.data.characteristics as ServiceCharacteristic[],
    notes: normalizeOptional(parsed.data.notes),
    startTime: normalizeOptional(parsed.data.startTime),
    endTime: normalizeOptional(parsed.data.endTime),
    status: parsed.data.status,
  });

  if (!service) return { ok: false, error: 'Service not found.' };
  revalidateServicePaths();
  return { ok: true, service };
}

export async function deleteSundayServiceAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardManage();
  if (!allowed.ok) return allowed;

  const deleted = await deleteSundayService(id);
  if (!deleted) return { ok: false, error: 'Service not found.' };
  revalidateServicePaths();
  return { ok: true };
}
