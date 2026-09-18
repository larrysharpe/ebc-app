'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import { LEGAL_PATHS } from '@/modules/legal';
import type { SessionUser } from '@/modules/auth/types/auth.types';
import { formatMinistryScopeLabels, isPlatformAdmin } from '@/modules/auth/utils/ministry-scope.utils';

export type UserMenuProps = {
  user: SessionUser;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

function roleSummary(user: SessionUser): string {
  return user.roles.map((role) => ROLE_LABELS[role]).join(' · ');
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = isPlatformAdmin(user.roles);
  const ministryScope = formatMinistryScopeLabels(user.ministryIds);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-ebc-burgundy text-sm font-bold text-white ring-2 ring-transparent transition hover:ring-ebc-burgundy/30 focus:outline-none focus:ring-ebc-burgundy/40 sm:h-10 sm:w-10"
      >
        {initials(user.name)}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 sm:w-64"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <p className="mt-1 text-xs text-ebc-burgundy">{roleSummary(user)}</p>
            {ministryScope ? (
              <p className="mt-0.5 text-xs text-slate-500">Ministries: {ministryScope}</p>
            ) : null}
          </div>

          <div className="py-1">
            <Link
              href="/account/preferences"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-ebc-burgundy"
            >
              Preferences
            </Link>
            <Link
              href="/account/notifications"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-ebc-burgundy"
            >
              Notifications
            </Link>
            <Link
              href="/account/permissions"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-ebc-burgundy"
            >
              Permissions
            </Link>

            <Link
              href={LEGAL_PATHS.privacy}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-ebc-burgundy"
            >
              Privacy policy
            </Link>
            <Link
              href={LEGAL_PATHS.terms}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-ebc-burgundy"
            >
              Terms of use
            </Link>

            {isAdmin ? (
              <>
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-ebc-burgundy"
                >
                  Settings
                </Link>
                <Link
                  href="/settings/users"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-ebc-burgundy"
                >
                  Staff accounts
                </Link>
                <Link
                  href="/settings/access"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-ebc-burgundy"
                >
                  Roles &amp; permissions
                </Link>
              </>
            ) : null}
          </div>

          <div className="border-t border-slate-100 py-1">
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-red-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
