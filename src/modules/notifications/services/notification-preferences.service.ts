import 'server-only';

import { requireSession } from '@/modules/auth/services/auth.service';
import type { SessionUser } from '@/modules/auth/types/auth.types';

import { NOTIFICATION_TOPIC_DEFINITIONS } from '../constants/notification-topics.constants';
import {
  getChannelPreference,
  listTopicPreferences,
  upsertChannelPreference,
  upsertTopicPreference,
} from '../repositories/notification-preference.repository';
import type {
  UpdateChannelPreferenceInput,
  UpdateTopicPreferenceInput,
} from '../schemas/notification-preferences.schemas';
import type {
  NotificationSettingsView,
  NotificationTopicId,
} from '../types/notification.types';
import {
  defaultChannelPreference,
  defaultTopicPreference,
  isEmailDeliveryConfigured,
  isPushDeliveryConfigured,
  isSmsDeliveryConfigured,
  resolveTopicPreference,
  topicsForUser,
  topicVisibleToRoles,
} from '../utils/notification-preferences.utils';

export type MinistryOption = {
  id: string;
  name: string;
};

export async function getNotificationSettingsForUser(
  user: SessionUser,
  ministryOptions: readonly MinistryOption[] = [],
): Promise<NotificationSettingsView> {
  const [storedChannels, storedTopics] = await Promise.all([
    getChannelPreference(user.id),
    listTopicPreferences(user.id),
  ]);

  const channels = storedChannels ?? defaultChannelPreference();
  const visibleTopics = topicsForUser(user);

  const topics = visibleTopics.map((definition) => {
    const preference = resolveTopicPreference({
      topic: definition.id,
      ministryId: '',
      stored: storedTopics,
    });

    const ministryPreferences =
      definition.ministryScoped && ministryOptions.length > 0
        ? ministryOptions.map((ministry) =>
            resolveTopicPreference({
              topic: definition.id,
              ministryId: ministry.id,
              stored: storedTopics,
            }),
          )
        : [];

    return {
      definition,
      preference:
        preference.topic === definition.id
          ? preference
          : defaultTopicPreference(definition.id),
      ministryPreferences,
    };
  });

  return {
    channels,
    topics,
    delivery: {
      emailConfigured: isEmailDeliveryConfigured(),
      pushConfigured: isPushDeliveryConfigured(),
      smsConfigured: isSmsDeliveryConfigured(),
    },
  };
}

export async function saveChannelPreferenceForSession(
  input: UpdateChannelPreferenceInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  await upsertChannelPreference(session.id, input);
  return { ok: true };
}

export async function saveTopicPreferenceForSession(
  input: UpdateTopicPreferenceInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const topic = input.topic as NotificationTopicId;
  const definition = NOTIFICATION_TOPIC_DEFINITIONS[topic];
  if (!definition || !topicVisibleToRoles(definition, session.roles)) {
    return { ok: false, error: 'That notification type is not available for your roles.' };
  }

  const ministryId = input.ministryId ?? '';
  if (ministryId) {
    if (!definition.ministryScoped) {
      return { ok: false, error: 'This notification cannot be scoped to a ministry.' };
    }
    const allowed =
      session.ministryIds.includes(ministryId) ||
      session.roles.includes('super_admin') ||
      session.roles.includes('admin') ||
      session.roles.includes('pastor') ||
      session.roles.includes('office_staff');
    if (!allowed) {
      return { ok: false, error: 'You cannot change settings for that ministry.' };
    }
  }

  await upsertTopicPreference(session.id, {
    topic,
    ministryId,
    emailEnabled: input.emailEnabled,
    pushEnabled: input.pushEnabled,
    smsEnabled: input.smsEnabled,
  });
  return { ok: true };
}
