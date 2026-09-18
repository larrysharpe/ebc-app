import 'server-only';

import { isPushDeliveryConfigured } from '../../utils/notification-preferences.utils';

export type PushMessage = {
  userId: string;
  title: string;
  body: string;
  href?: string;
};

export type PushChannelResult =
  | { ok: true; status: 'sent' }
  | { ok: false; status: 'skipped' | 'failed'; reason: string };

/**
 * Web-push / app-push stub. Requires VAPID keys and stored PushSubscription rows.
 */
export async function deliverPush(
  message: PushMessage,
): Promise<PushChannelResult> {
  if (!isPushDeliveryConfigured()) {
    return {
      ok: false,
      status: 'skipped',
      reason: 'push_not_configured',
    };
  }

  void message;
  return {
    ok: false,
    status: 'skipped',
    reason: 'push_transport_not_implemented',
  };
}
