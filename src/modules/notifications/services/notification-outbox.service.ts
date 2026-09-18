import 'server-only';

import { findUserById } from '@/modules/auth/repositories/user.repository';

import { deliverEmail } from '../integrations/email/email-channel';
import { deliverPush } from '../integrations/push/push-channel';
import { deliverSms } from '../integrations/sms/sms-channel';
import {
  listPendingOutboxEntries,
  updateOutboxEntry,
} from '../repositories/notification-outbox.repository';
import { findPhonesByEmails } from '../repositories/notify-phone.repository';
import {
  isEmailDeliveryConfigured,
  isPushDeliveryConfigured,
  isSmsDeliveryConfigured,
} from '../utils/notification-preferences.utils';

export type ProcessPendingOutboxResult = {
  attempted: number;
  sent: number;
  failed: number;
  stillPending: number;
  skipped: number;
};

/**
 * Retry pending outbox rows once providers are configured (SMTP / VAPID / Twilio).
 */
export async function processPendingOutbox(
  limit = 50,
): Promise<ProcessPendingOutboxResult> {
  const pending = await listPendingOutboxEntries(limit);
  let sent = 0;
  let failed = 0;
  let stillPending = 0;
  let skipped = 0;

  const smsUserIds = pending
    .filter((row) => row.channel === 'sms')
    .map((row) => row.userId);
  const smsUsers = await Promise.all(
    [...new Set(smsUserIds)].map(async (userId) => {
      const user = await findUserById(userId);
      return user ? ([userId, user.email] as const) : null;
    }),
  );
  const emailByUserId = new Map(
    smsUsers.filter((row): row is readonly [string, string] => Boolean(row)),
  );
  const phonesByEmail = await findPhonesByEmails([...emailByUserId.values()]);

  for (const row of pending) {
    if (row.channel === 'email') {
      if (!isEmailDeliveryConfigured()) {
        stillPending += 1;
        continue;
      }
      const user = await findUserById(row.userId);
      if (!user?.email) {
        skipped += 1;
        await updateOutboxEntry(row.id, {
          status: 'skipped',
          skipReason: 'no_email',
          error: null,
        });
        continue;
      }
      const result = await deliverEmail({
        to: user.email,
        subject: row.title,
        text: row.body,
        href: row.href ?? undefined,
      });
      if (result.ok) {
        sent += 1;
        await updateOutboxEntry(row.id, {
          status: 'sent',
          skipReason: null,
          error: null,
          sentAt: new Date(),
        });
        continue;
      }
      if (result.reason === 'smtp_not_configured' || result.reason === 'smtp_transport_not_implemented') {
        stillPending += 1;
        continue;
      }
      failed += 1;
      await updateOutboxEntry(row.id, {
        status: 'failed',
        skipReason: null,
        error: result.reason,
      });
      continue;
    }

    if (row.channel === 'push') {
      if (!isPushDeliveryConfigured()) {
        stillPending += 1;
        continue;
      }
      const result = await deliverPush({
        userId: row.userId,
        title: row.title,
        body: row.body,
        href: row.href ?? undefined,
      });
      if (result.ok) {
        sent += 1;
        await updateOutboxEntry(row.id, {
          status: 'sent',
          skipReason: null,
          error: null,
          sentAt: new Date(),
        });
        continue;
      }
      if (
        result.reason === 'push_not_configured' ||
        result.reason === 'push_transport_not_implemented'
      ) {
        stillPending += 1;
        continue;
      }
      failed += 1;
      await updateOutboxEntry(row.id, {
        status: 'failed',
        skipReason: null,
        error: result.reason,
      });
      continue;
    }

    if (row.channel === 'sms') {
      if (!isSmsDeliveryConfigured()) {
        stillPending += 1;
        continue;
      }
      const email = emailByUserId.get(row.userId);
      const phone = email
        ? phonesByEmail.get(email.trim().toLowerCase())
        : undefined;
      if (!phone) {
        skipped += 1;
        await updateOutboxEntry(row.id, {
          status: 'skipped',
          skipReason: 'no_phone',
          error: null,
        });
        continue;
      }
      const result = await deliverSms({ to: phone, body: row.body });
      if (result.ok) {
        sent += 1;
        await updateOutboxEntry(row.id, {
          status: 'sent',
          skipReason: null,
          error: null,
          sentAt: new Date(),
        });
        continue;
      }
      if (result.reason === 'sms_not_configured') {
        stillPending += 1;
        continue;
      }
      failed += 1;
      await updateOutboxEntry(row.id, {
        status: 'failed',
        skipReason: null,
        error: result.reason,
      });
    }
  }

  return {
    attempted: pending.length,
    sent,
    failed,
    stillPending,
    skipped,
  };
}
