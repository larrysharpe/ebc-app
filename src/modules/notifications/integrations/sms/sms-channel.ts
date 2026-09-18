import 'server-only';

import { isSmsDeliveryConfigured } from '../../utils/notification-preferences.utils';

export type SmsMessage = {
  to: string;
  body: string;
};

export type SmsChannelResult =
  | { ok: true; status: 'sent'; providerId?: string }
  | { ok: false; status: 'skipped' | 'failed'; reason: string };

type TwilioConfig = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
};

function readTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() ?? '';
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() ?? '';
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim() ?? '';
  if (!accountSid || !authToken || !fromNumber) return null;
  return { accountSid, authToken, fromNumber };
}

/**
 * SMS delivery via Twilio Messages API when TWILIO_* env vars are set.
 * Without credentials, messages stay pending in the outbox for later retry.
 */
export async function deliverSms(message: SmsMessage): Promise<SmsChannelResult> {
  if (!isSmsDeliveryConfigured()) {
    return {
      ok: false,
      status: 'skipped',
      reason: 'sms_not_configured',
    };
  }

  const config = readTwilioConfig();
  if (!config) {
    return {
      ok: false,
      status: 'skipped',
      reason: 'sms_not_configured',
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
    'base64',
  );
  const body = new URLSearchParams({
    To: message.to,
    From: config.fromNumber,
    Body: message.body,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      // Do not log response body — may include recipient phone / PII.
      return {
        ok: false,
        status: 'failed',
        reason: `twilio_http_${response.status}`,
      };
    }

    const payload = (await response.json()) as { sid?: string };
    return {
      ok: true,
      status: 'sent',
      providerId: typeof payload.sid === 'string' ? payload.sid : undefined,
    };
  } catch {
    return {
      ok: false,
      status: 'failed',
      reason: 'twilio_request_failed',
    };
  }
}
