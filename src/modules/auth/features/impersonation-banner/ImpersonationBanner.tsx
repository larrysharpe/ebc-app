'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { stopImpersonatingAction } from '@/modules/auth/actions/login-as.actions';

export type ImpersonationBannerProps = {
  viewingAsName: string;
  actorName: string;
};

export function ImpersonationBanner({
  viewingAsName,
  actorName,
}: ImpersonationBannerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReturn() {
    setError(null);
    startTransition(async () => {
      const result = await stopImpersonatingAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push('/');
      router.refresh();
    });
  }

  return (
    <div
      role="status"
      className="flex flex-col gap-2 bg-sky-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
    >
      <div className="min-w-0 text-center sm:text-left">
        <p className="text-sm font-semibold text-sky-950">
          Viewing as {viewingAsName}
        </p>
        <p className="mt-0.5 text-xs text-sky-900/90 sm:text-sm">
          Signed in as Super Admin ({actorName}). Changes use this user’s access.
        </p>
        {error ? (
          <p className="mt-1 text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleReturn}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-sky-300 bg-white px-3 text-sm font-semibold text-sky-950 hover:bg-sky-100 disabled:opacity-50"
      >
        {isPending ? 'Returning…' : 'Return to my account'}
      </button>
    </div>
  );
}
