import 'server-only';

import { listUsers } from '@/modules/auth/repositories/user.repository';
import type { SessionUser } from '@/modules/auth/types/auth.types';
import { hasAnyRole } from '@/modules/auth/utils/roles.utils';

import { NOTIFICATION_TOPIC_DEFINITIONS } from '../constants/notification-topics.constants';
import { deliverEmail } from '../integrations/email/email-channel';
import { deliverPush } from '../integrations/push/push-channel';
import { deliverSms } from '../integrations/sms/sms-channel';
import {
  createOutboxEntries,
  type OutboxCreateInput,
} from '../repositories/notification-outbox.repository';
import { findPhonesByEmails } from '../repositories/notify-phone.repository';
import {
  getChannelPreference,
  listTopicPreferences,
} from '../repositories/notification-preference.repository';
import type {
  NotificationChannel,
  NotifyInput,
  NotifyResult,
} from '../types/notification.types';
import {
  channelAllowed,
  defaultChannelPreference,
  isEmailDeliveryConfigured,
  isPushDeliveryConfigured,
  isSmsDeliveryConfigured,
  resolveTopicPreference,
  topicVisibleToRoles,
} from '../utils/notification-preferences.utils';
import { buildSmsText } from '../utils/sms.utils';

const DELIVERY_CHANNELS: NotificationChannel[] = ['email', 'push', 'sms'];

const RETRYABLE_SKIP_REASONS = new Set([
  'smtp_not_configured',
  'smtp_transport_not_implemented',
  'push_not_configured',
  'push_transport_not_implemented',
  'sms_not_configured',
]);

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.APP_URL?.replace(/\/$/, '') ||
    ''
  );
}

async function resolveRecipients(input: NotifyInput): Promise<SessionUser[]> {
  const definition = NOTIFICATION_TOPIC_DEFINITIONS[input.topic];
  const audienceRoles = input.roles?.length
    ? input.roles.filter((role) => definition.audienceRoles.includes(role))
    : definition.audienceRoles;

  const byId = new Map<string, SessionUser>();

  if (input.recipientUserIds?.length) {
    const users = await listUsers();
    for (const user of users) {
      if (!input.recipientUserIds.includes(user.id)) continue;
      if (user.status !== 'active') continue;
      if (!topicVisibleToRoles(definition, user.roles)) continue;
      byId.set(user.id, user);
    }
  } else {
    const users = await listUsers();
    for (const user of users) {
      if (user.status !== 'active') continue;
      if (!hasAnyRole(user.roles, audienceRoles)) continue;
      if (
        definition.ministryScoped &&
        input.ministryId &&
        !user.ministryIds.includes(input.ministryId) &&
        !hasAnyRole(user.roles, [
          'super_admin',
          'admin',
          'pastor',
          'office_staff',
        ])
      ) {
        continue;
      }
      byId.set(user.id, user);
    }
  }

  if (input.actorUserId) {
    byId.delete(input.actorUserId);
  }

  return [...byId.values()];
}

function outboxFromResult(input: {
  userId: string;
  topic: NotifyInput['topic'];
  channel: NotificationChannel;
  title: string;
  body: string;
  href?: string;
  payload?: Record<string, unknown>;
  result:
    | { ok: true; status: 'sent' }
    | { ok: false; status: 'skipped' | 'failed'; reason: string };
}): OutboxCreateInput {
  return {
    userId: input.userId,
    topic: input.topic,
    channel: input.channel,
    title: input.title,
    body: input.body,
    href: input.href,
    payload: input.payload,
    status: input.result.ok
      ? 'sent'
      : input.result.status === 'failed'
        ? 'failed'
        : 'skipped',
    skipReason: input.result.ok ? undefined : input.result.reason,
    error:
      !input.result.ok && input.result.status === 'failed'
        ? input.result.reason
        : undefined,
    sentAt: input.result.ok ? new Date() : undefined,
  };
}

/**
 * Fan out a role-appropriate notification. Queues email/push/SMS in the outbox;
 * delivery is skipped until SMTP / VAPID / Twilio are configured (SMS sends
 * immediately when Twilio credentials are present).
 */
export async function notify(input: NotifyInput): Promise<NotifyResult> {
  const recipients = await resolveRecipients(input);
  const emailConfigured = isEmailDeliveryConfigured();
  const pushConfigured = isPushDeliveryConfigured();
  const smsConfigured = isSmsDeliveryConfigured();
  const phonesByEmail = await findPhonesByEmails(
    recipients.map((user) => user.email),
  );
  const outbox: OutboxCreateInput[] = [];

  for (const user of recipients) {
    const [channelsStored, topicsStored] = await Promise.all([
      getChannelPreference(user.id),
      listTopicPreferences(user.id),
    ]);
    const channels = channelsStored ?? defaultChannelPreference();
    const topicPref = resolveTopicPreference({
      topic: input.topic,
      ministryId: input.ministryId ?? '',
      stored: topicsStored,
    });

    for (const channel of DELIVERY_CHANNELS) {
      if (!channelAllowed(channels, topicPref, channel)) {
        outbox.push({
          userId: user.id,
          topic: input.topic,
          channel,
          title: input.title,
          body: input.body,
          href: input.href,
          payload: input.payload,
          status: 'skipped',
          skipReason: 'user_preference',
        });
        continue;
      }

      if (channel === 'email') {
        const emailText = input.emailBody?.trim() || input.body;
        const result = await deliverEmail({
          to: user.email,
          subject: input.title,
          text: emailText,
          href: input.href,
        });
        outbox.push(
          outboxFromResult({
            userId: user.id,
            topic: input.topic,
            channel,
            title: input.title,
            body: emailText,
            href: input.href,
            payload: input.payload,
            result,
          }),
        );
        continue;
      }

      if (channel === 'push') {
        const result = await deliverPush({
          userId: user.id,
          title: input.title,
          body: input.body,
          href: input.href,
        });
        outbox.push(
          outboxFromResult({
            userId: user.id,
            topic: input.topic,
            channel,
            title: input.title,
            body: input.body,
            href: input.href,
            payload: input.payload,
            result,
          }),
        );
        continue;
      }

      const phone = phonesByEmail.get(user.email.trim().toLowerCase());
      if (!phone) {
        outbox.push({
          userId: user.id,
          topic: input.topic,
          channel: 'sms',
          title: input.title,
          body: input.body,
          href: input.href,
          payload: input.payload,
          status: 'skipped',
          skipReason: 'no_phone',
        });
        continue;
      }

      const smsText = buildSmsText({
        body: input.smsBody?.trim() || input.body,
        href: input.href,
        appOrigin: appOrigin(),
      });
      const result = await deliverSms({ to: phone, body: smsText });
      outbox.push(
        outboxFromResult({
          userId: user.id,
          topic: input.topic,
          channel: 'sms',
          title: input.title,
          body: smsText,
          href: input.href,
          payload: input.payload,
          result,
        }),
      );
    }
  }

  const normalized = outbox.map((entry) => {
    if (
      entry.status === 'skipped' &&
      entry.skipReason &&
      RETRYABLE_SKIP_REASONS.has(entry.skipReason)
    ) {
      return { ...entry, status: 'pending' as const, skipReason: entry.skipReason };
    }
    return entry;
  });

  const queued = normalized.filter(
    (entry) => entry.status === 'pending' || entry.status === 'sent',
  ).length;
  const skipped = normalized.filter((entry) => entry.status === 'skipped').length;

  await createOutboxEntries(normalized);

  return {
    recipientCount: recipients.length,
    queued,
    skipped,
    emailConfigured,
    pushConfigured,
    smsConfigured,
  };
}
