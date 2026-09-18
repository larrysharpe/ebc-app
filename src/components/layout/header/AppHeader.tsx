import Image from 'next/image';
import type { ReactNode } from 'react';

import { CursorPromptBar } from '@/modules/cursor';
import { LOGO_ALT, LOGO_URL } from '@/lib/church';
import type { SessionUser } from '@/modules/auth/types/auth.types';
import type { CursorStatusResponse } from '@/modules/cursor/types/cursor.types';
import { HeaderChurchLinks } from './HeaderChurchLinks';
import { UserMenu } from './UserMenu';

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  pagePath?: string;
  user: SessionUser;
  cursorStatus?: Pick<CursorStatusResponse, 'enabled' | 'runtime' | 'canWrite'>;
  onMenuClick?: () => void;
  menuOpen?: boolean;
  /** Second column beside the page title (e.g. Still drafting). */
  titleAside?: ReactNode;
  /** Full-width strip under the title row (e.g. impersonation). */
  banner?: ReactNode;
};

export function AppHeader({
  title,
  subtitle,
  pagePath,
  user,
  cursorStatus,
  onMenuClick,
  menuOpen,
  titleAside,
  banner,
}: AppHeaderProps) {
  const showTitleBesideLogo = !titleAside;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] lg:px-8">
        {/* Keep above Ask Cursor — overflow from the prompt bar was intercepting taps on mobile. */}
        <div className="relative z-20 flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          {onMenuClick ? (
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-ebc-burgundy lg:hidden"
              onClick={onMenuClick}
              aria-label={menuOpen ? 'Menu open' : 'Open navigation menu'}
              aria-expanded={menuOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          ) : null}

          <Image
            src={LOGO_URL}
            alt={LOGO_ALT}
            width={160}
            height={48}
            className="h-8 w-auto max-w-[96px] shrink-0 sm:h-10 sm:max-w-[160px]"
            priority
          />

          {showTitleBesideLogo ? (
            <div className="min-w-0 hidden md:block">
              <h1 className="truncate text-lg font-bold text-ebc-burgundy sm:text-xl lg:text-2xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative z-0 min-w-0 flex-1 overflow-hidden lg:flex lg:justify-center">
          <CursorPromptBar
            pagePath={pagePath}
            pageTitle={title}
            initialStatus={cursorStatus}
          />
        </div>

        <div className="relative z-20 flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <div className="hidden lg:block">
            <HeaderChurchLinks />
          </div>
          <UserMenu user={user} />
        </div>
      </div>

      {titleAside ? (
        <div className="border-t border-slate-200/80 bg-amber-50/80 px-3 py-2.5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 items-center gap-3 sm:gap-6">
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-ebc-burgundy sm:text-lg lg:text-xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>
              ) : null}
            </div>
            <div className="min-w-0 text-right">{titleAside}</div>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200/80 px-3 py-2 md:hidden">
          <h1 className="truncate text-base font-bold text-ebc-burgundy">{title}</h1>
          {subtitle ? <p className="truncate text-xs text-slate-500">{subtitle}</p> : null}
        </div>
      )}

      {banner ? <div className="border-t border-slate-200/80">{banner}</div> : null}
    </header>
  );
}
