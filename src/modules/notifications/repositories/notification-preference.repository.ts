import 'server-only';

import { prisma } from '@/lib/db';

import type {
  ChannelPreference,
  NotificationTopicId,
  TopicPreference,
} from '../types/notification.types';

export async function getChannelPreference(
  userId: string,
): Promise<ChannelPreference | null> {
  const row = await prisma.notificationChannelPreference.findUnique({
    where: { userId },
  });
  if (!row) return null;
  return {
    emailEnabled: row.emailEnabled,
    pushEnabled: row.pushEnabled,
    smsEnabled: row.smsEnabled,
  };
}

export async function upsertChannelPreference(
  userId: string,
  preference: ChannelPreference,
): Promise<ChannelPreference> {
  const row = await prisma.notificationChannelPreference.upsert({
    where: { userId },
    create: {
      userId,
      emailEnabled: preference.emailEnabled,
      pushEnabled: preference.pushEnabled,
      smsEnabled: preference.smsEnabled,
    },
    update: {
      emailEnabled: preference.emailEnabled,
      pushEnabled: preference.pushEnabled,
      smsEnabled: preference.smsEnabled,
    },
  });
  return {
    emailEnabled: row.emailEnabled,
    pushEnabled: row.pushEnabled,
    smsEnabled: row.smsEnabled,
  };
}

export async function listTopicPreferences(
  userId: string,
): Promise<TopicPreference[]> {
  const rows = await prisma.notificationTopicPreference.findMany({
    where: { userId },
  });
  return rows.map((row) => ({
    topic: row.topic as NotificationTopicId,
    ministryId: row.ministryId,
    emailEnabled: row.emailEnabled,
    pushEnabled: row.pushEnabled,
    smsEnabled: row.smsEnabled,
  }));
}

export async function upsertTopicPreference(
  userId: string,
  preference: TopicPreference,
): Promise<TopicPreference> {
  const row = await prisma.notificationTopicPreference.upsert({
    where: {
      userId_topic_ministryId: {
        userId,
        topic: preference.topic,
        ministryId: preference.ministryId,
      },
    },
    create: {
      userId,
      topic: preference.topic,
      ministryId: preference.ministryId,
      emailEnabled: preference.emailEnabled,
      pushEnabled: preference.pushEnabled,
      smsEnabled: preference.smsEnabled,
    },
    update: {
      emailEnabled: preference.emailEnabled,
      pushEnabled: preference.pushEnabled,
      smsEnabled: preference.smsEnabled,
    },
  });
  return {
    topic: row.topic as NotificationTopicId,
    ministryId: row.ministryId,
    emailEnabled: row.emailEnabled,
    pushEnabled: row.pushEnabled,
    smsEnabled: row.smsEnabled,
  };
}
