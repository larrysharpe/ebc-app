import 'server-only';

import { isEmailDeliveryConfigured } from '../../utils/notification-preferences.utils';

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  href?: string;
};

export type EmailChannelResult =
  | { ok: true; status: 'sent' }
  | { ok: false; status: 'skipped' | 'failed'; reason: string };

/**
 * SMTP delivery stub. When SMTP_* env vars are present, this is the hook
 * point for nodemailer (or similar). Until then, messages stay in the outbox.
 */
export async function deliverEmail(
  message: EmailMessage,
): Promise<EmailChannelResult> {
  if (!isEmailDeliveryConfigured()) {
    return {
      ok: false,
      status: 'skipped',
      reason: 'smtp_not_configured',
    };
  }

  // Future: nodemailer transport using SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
  void message;
  return {
    ok: false,
    status: 'skipped',
    reason: 'smtp_transport_not_implemented',
  };
}
