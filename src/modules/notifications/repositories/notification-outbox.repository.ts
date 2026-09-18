import 'server-only';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';

import type {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationTopicId,
} from '../types/notification.types';

export type OutboxCreateInput = {
  userId: string;
  topic: NotificationTopicId;
  channel: NotificationChannel;
  title: string;
  body: string;
  href?: string;
  payload?: Record<string, unknown>;
  status: NotificationDeliveryStatus;
  skipReason?: string;
  error?: string;
  sentAt?: Date;
};

export async function createOutboxEntries(
  entries: readonly OutboxCreateInput[],
): Promise<number> {
  if (entries.length === 0) return 0;
  const data: Prisma.NotificationOutboxCreateManyInput[] = entries.map(
    (entry) => ({
      userId: entry.userId,
      topic: entry.topic,
      channel: entry.channel,
      title: entry.title,
      body: entry.body,
      href: entry.href,
      payload:
        entry.payload === undefined
          ? undefined
          : (entry.payload as Prisma.InputJsonValue),
      status: entry.status,
      skipReason: entry.skipReason,
      error: entry.error,
      sentAt: entry.sentAt,
    }),
  );
  const result = await prisma.notificationOutbox.createMany({ data });
  return result.count;
}

export type OutboxRow = {
  id: string;
  userId: string;
  topic: NotificationTopicId;
  channel: NotificationChannel;
  title: string;
  body: string;
  href: string | null;
  status: NotificationDeliveryStatus;
  skipReason: string | null;
};

export async function listPendingOutboxEntries(
  limit = 50,
): Promise<OutboxRow[]> {
  const rows = await prisma.notificationOutbox.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: Math.min(100, Math.max(1, limit)),
  });
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    topic: row.topic as NotificationTopicId,
    channel: row.channel as NotificationChannel,
    title: row.title,
    body: row.body,
    href: row.href,
    status: row.status as NotificationDeliveryStatus,
    skipReason: row.skipReason,
  }));
}

export async function updateOutboxEntry(
  id: string,
  update: {
    status: NotificationDeliveryStatus;
    skipReason?: string | null;
    error?: string | null;
    sentAt?: Date | null;
  },
): Promise<void> {
  await prisma.notificationOutbox.update({
    where: { id },
    data: {
      status: update.status,
      skipReason: update.skipReason === undefined ? undefined : update.skipReason,
      error: update.error === undefined ? undefined : update.error,
      sentAt: update.sentAt === undefined ? undefined : update.sentAt,
    },
  });
}
