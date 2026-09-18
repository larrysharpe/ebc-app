'use client';

import { useRouter } from 'next/navigation';
import { useTransition, type ReactElement } from 'react';

import { useToast } from '@/components/ui/Toast';
import { sendPlanAction } from '../../../actions/music.actions';

type SendPlanButtonProps = {
  planId: string;
  disabled?: boolean;
};

export function SendPlanButton({
  planId,
  disabled,
}: SendPlanButtonProps): ReactElement {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          const result = await sendPlanAction(planId);
          if (!result.ok) {
            toast({
              title: 'Could not share plan',
              description: result.error,
              tone: 'error',
            });
            return;
          }
          const delivery = 'delivery' in result ? result.delivery : null;
          if (delivery) {
            const queued: string[] = [];
            if (!delivery.emailConfigured) queued.push('email (SMTP)');
            if (!delivery.pushConfigured) queued.push('app alerts (push)');
            if (!delivery.smsConfigured) queued.push('text (Twilio)');
            const channelNote =
              queued.length === 3
                ? 'Email, app alerts, and text are queued until delivery is set up.'
                : queued.length > 0
                  ? `Queued until configured: ${queued.join(', ')}.`
                  : undefined;
            toast({
              title: `Shared with ${delivery.recipientCount} people`,
              description:
                channelNote ??
                'People can manage what they receive under Account → Notifications.',
              tone: 'success',
              durationMs: 7000,
            });
          } else {
            toast({ title: 'Shared with the choir', tone: 'success' });
          }
          router.refresh();
        })
      }
      className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-semibold text-white transition hover:bg-ebc-burgundy/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Sharing…' : 'Share with choir'}
    </button>
  );
}
