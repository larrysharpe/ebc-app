'use client';

import { useRouter } from 'next/navigation';
import { useTransition, type ReactElement } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { deletePlanAction } from '@/modules/music/actions/music.actions';

export type DeletePlanButtonProps = {
  planId: string;
  planTitle: string;
};

export function DeletePlanButton({
  planId,
  planTitle,
}: DeletePlanButtonProps): ReactElement {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  async function handleDelete(): Promise<void> {
    const confirmed = await confirm({
      title: 'Delete this choir plan?',
      description: `“${planTitle}” will be removed. This cannot be undone.`,
      confirmLabel: 'Delete plan',
      tone: 'danger',
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deletePlanAction(planId);
      if (!result.ok) {
        toast({ title: 'Could not delete plan', description: result.error, tone: 'error' });
        return;
      }
      toast({ title: 'Choir plan deleted', tone: 'success' });
      router.push('/music/plans');
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        void handleDelete();
      }}
      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? 'Deleting…' : 'Delete plan'}
    </button>
  );
}
