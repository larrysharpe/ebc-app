'use client';

import type { ReactElement, ReactNode } from 'react';

import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { ToastProvider } from '@/components/ui/Toast';

export function AppFeedbackProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
