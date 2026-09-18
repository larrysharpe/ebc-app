'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/modules/auth/services/auth.service';
import { notify } from '@/modules/notifications';

import {
  createVisitor,
  updateVisitorStatus,
} from '../repositories/visitor.repository';
import type { CreateVisitorInput, VisitorStatus } from '../types/visitor.types';

export async function logVisitorAction(input: CreateVisitorInput) {
  if (!input.firstName.trim() || !input.lastName.trim() || !input.visitDate) {
    return { ok: false as const, error: 'First name, last name, and visit date are required.' };
  }

  const visitor = await createVisitor(input);
  const session = await getSession();

  await notify({
    topic: 'visitors.new',
    actorUserId: session?.id,
    title: 'New visitor logged',
    body: 'A first-time guest was added for follow-up. Open Visitors to review.',
    href: '/visitors',
    payload: { visitorId: visitor.id },
  });

  revalidatePath('/');
  revalidatePath('/visitors');

  return { ok: true as const, visitor };
}

export async function updateVisitorStatusAction(id: string, status: VisitorStatus) {
  const visitor = await updateVisitorStatus(id, status);
  if (!visitor) return { ok: false as const, error: 'Visitor not found.' };

  revalidatePath('/');
  revalidatePath('/visitors');

  return { ok: true as const, visitor };
}
