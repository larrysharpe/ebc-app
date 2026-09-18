'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import type { AppAction } from './app-control.types';
import { isAllowedAppPath } from './app-control.utils';

export type UseAppControlResult = {
  executeAction: (action: AppAction) => boolean;
};

export function useAppControl(): UseAppControlResult {
  const router = useRouter();

  const executeAction = useCallback(
    (action: AppAction): boolean => {
      if (action.type !== 'navigate') return false;
      if (!isAllowedAppPath(action.path)) return false;
      router.push(action.path);
      return true;
    },
    [router],
  );

  return { executeAction };
}
