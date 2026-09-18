'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import type { SidebarMinistry } from '@/components/layout/sidebar/Sidebar.types';
import { AppHeader } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { DevAccountSwitcher } from '@/modules/auth/features/dev-account-switcher/DevAccountSwitcher';
import type { SessionUser } from '@/modules/auth/types/auth.types';
import type { DevAccountOption } from '@/modules/auth/types/dev-auth.types';
import type { CursorStatusResponse } from '@/modules/cursor/types/cursor.types';

export type AppShellLayoutProps = {
  currentPath: string;
  title: string;
  subtitle?: string;
  user: SessionUser;
  ministries: SidebarMinistry[];
  ministryOnlyNav?: boolean;
  devAccounts?: DevAccountOption[];
  cursorStatus?: Pick<CursorStatusResponse, 'enabled' | 'runtime' | 'canWrite'>;
  /** Second column beside the page title (e.g. Still drafting). */
  headerTitleAside?: ReactNode;
  /** Full-width sticky strip under the title row (e.g. impersonation). */
  headerBanner?: ReactNode;
  children: ReactNode;
};

export function AppShellLayout({
  currentPath,
  title,
  subtitle,
  user,
  ministries,
  ministryOnlyNav = false,
  devAccounts = [],
  cursorStatus,
  headerTitleAside,
  headerBanner,
  children,
}: AppShellLayoutProps) {
  const pathname = usePathname();
  /** Prefer the real URL so nested routes (e.g. /music/people) highlight correctly. */
  const activePath = pathname || currentPath;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [activePath]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex h-screen max-h-[100dvh] overflow-hidden">
      <Sidebar
        currentPath={activePath}
        userRoles={user.roles}
        ministries={ministries}
        ministryOnlyNav={ministryOnlyNav}
        className="hidden w-64 shrink-0 bg-ebc-burgundy text-white lg:flex"
      />

      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <Sidebar
        currentPath={activePath}
        userRoles={user.roles}
        ministries={ministries}
        ministryOnlyNav={ministryOnlyNav}
        showChurchLifeLinks
        className={`fixed inset-y-0 left-0 z-50 w-[min(100vw,18rem)] shrink-0 bg-ebc-burgundy text-white shadow-xl transition-transform duration-200 ease-out lg:hidden ${
          mobileNavOpen
            ? 'translate-x-0'
            : 'pointer-events-none invisible -translate-x-full'
        }`}
        onNavigate={() => setMobileNavOpen(false)}
        ariaHidden={!mobileNavOpen}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <AppHeader
          title={title}
          subtitle={subtitle}
          pagePath={activePath}
          user={user}
          cursorStatus={cursorStatus}
          onMenuClick={() => setMobileNavOpen(true)}
          menuOpen={mobileNavOpen}
          titleAside={headerTitleAside}
          banner={headerBanner}
        />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:max-w-7xl">
          {children}
        </main>
      </div>

      {devAccounts.length > 0 ? (
        <DevAccountSwitcher
          accounts={devAccounts}
          currentEmail={user.email}
          returnPath={activePath}
        />
      ) : null}
    </div>
  );
}
