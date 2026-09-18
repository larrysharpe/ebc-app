import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppShellLayout } from './AppShellLayout';
import { ImpersonationBanner } from '@/modules/auth/features/impersonation-banner';
import { getSession } from '@/modules/auth/services/auth.service';
import { canEditAppViaCursor } from '@/modules/auth/utils/cursor-access.utils';
import {
  filterMinistriesForUser,
  isMinistryOnlyLeader,
} from '@/modules/auth/utils/ministry-scope.utils';
import { listDevAccountOptions } from '@/modules/auth/utils/dev-account-options.utils';
import { getCursorStatus } from '@/modules/cursor/services/cursor-agent.service';
import { listMinistries } from '@/modules/ministries/repositories/ministry.repository';

export type AppShellProps = {
  currentPath: string;
  title: string;
  subtitle?: string;
  /** Second column beside the page title (e.g. Still drafting). */
  headerTitleAside?: ReactNode;
  /** Full-width sticky strip under the title row. */
  headerBanner?: ReactNode;
  children: ReactNode;
};

export async function AppShell({
  currentPath,
  title,
  subtitle,
  headerTitleAside,
  headerBanner,
  children,
}: AppShellProps) {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }

  const canWrite = canEditAppViaCursor(session);
  const cursorStatus = getCursorStatus(canWrite);
  const [devAccounts, ministriesRaw] = await Promise.all([
    listDevAccountOptions(),
    listMinistries(),
  ]);
  const ministries = filterMinistriesForUser(session, ministriesRaw)
    .map((ministry) => ({ slug: ministry.slug, name: ministry.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const ministryOnlyNav = isMinistryOnlyLeader(session);

  return (
    <AppShellLayout
      currentPath={currentPath}
      title={title}
      subtitle={subtitle}
      user={session}
      ministries={ministries}
      ministryOnlyNav={ministryOnlyNav}
      devAccounts={devAccounts}
      cursorStatus={{
        enabled: cursorStatus.enabled,
        runtime: cursorStatus.runtime,
        canWrite: cursorStatus.canWrite,
      }}
      headerTitleAside={headerTitleAside}
      headerBanner={
        session.impersonator ? (
          <>
            <ImpersonationBanner
              viewingAsName={session.name}
              actorName={session.impersonator.name}
            />
            {headerBanner}
          </>
        ) : (
          headerBanner
        )
      }
    >
      {children}
    </AppShellLayout>
  );
}
