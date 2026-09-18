import type { SessionUser, UserRole } from '@/modules/auth/types/auth.types';
import {
  getMinistryScopeLabel,
  hasGlobalMinistryAccess,
} from '@/modules/auth/utils/ministry-scope.utils';
import { hasAnyRole } from '@/modules/auth/utils/roles.utils';

import { NOTIFICATION_TOPIC_DEFINITIONS } from '../constants/notification-topics.constants';
import type {
  ChannelPreference,
  NotificationChannel,
  NotificationTopicDefinition,
  NotificationTopicId,
  TopicPreference,
} from '../types/notification.types';

export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim());
}

export function isPushDeliveryConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY?.trim() && process.env.VAPID_PRIVATE_KEY?.trim(),
  );
}

export function isSmsDeliveryConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_NUMBER?.trim(),
  );
}

export function defaultChannelPreference(): ChannelPreference {
  return { emailEnabled: true, pushEnabled: true, smsEnabled: true };
}

export function defaultTopicPreference(
  topic: NotificationTopicId,
  ministryId = '',
): TopicPreference {
  const definition = NOTIFICATION_TOPIC_DEFINITIONS[topic];
  return {
    topic,
    ministryId,
    emailEnabled: definition.defaultEmail,
    pushEnabled: definition.defaultPush,
    smsEnabled: definition.defaultSms,
  };
}

export function topicVisibleToRoles(
  definition: NotificationTopicDefinition,
  roles: readonly UserRole[],
): boolean {
  return hasAnyRole(roles, definition.audienceRoles);
}

export function topicsForUser(
  user: Pick<SessionUser, 'roles' | 'ministryIds'>,
): NotificationTopicDefinition[] {
  return Object.values(NOTIFICATION_TOPIC_DEFINITIONS).filter((definition) => {
    if (!topicVisibleToRoles(definition, user.roles)) return false;
    if (definition.ministryScoped) {
      return hasGlobalMinistryAccess(user.roles) || user.ministryIds.length > 0;
    }
    return true;
  });
}

export function resolveTopicPreference(input: {
  topic: NotificationTopicId;
  ministryId?: string;
  stored: readonly TopicPreference[];
}): TopicPreference {
  const ministryId = input.ministryId ?? '';
  const exact = input.stored.find(
    (row) => row.topic === input.topic && row.ministryId === ministryId,
  );
  if (exact) return exact;

  if (ministryId) {
    const global = input.stored.find(
      (row) => row.topic === input.topic && row.ministryId === '',
    );
    if (global) {
      return { ...global, ministryId };
    }
  }

  return defaultTopicPreference(input.topic, ministryId);
}

export function channelAllowed(
  channels: ChannelPreference,
  topicPref: TopicPreference,
  channel: NotificationChannel,
): boolean {
  if (channel === 'email') {
    return channels.emailEnabled && topicPref.emailEnabled;
  }
  if (channel === 'push') {
    return channels.pushEnabled && topicPref.pushEnabled;
  }
  return channels.smsEnabled && topicPref.smsEnabled;
}

export function ministryLabel(ministryId: string): string {
  return getMinistryScopeLabel(ministryId) ?? ministryId;
}
