'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { NavIconGlyph } from './NavIconGlyph';
import type { SidebarMinistry } from './Sidebar.types';

export type SidebarMinistriesSectionProps = {
  ministries: SidebarMinistry[];
  currentPath: string;
  onNavigate?: () => void;
};

export function SidebarMinistriesSection({
  ministries,
  currentPath,
  onNavigate,
}: SidebarMinistriesSectionProps) {
  const isSectionActive =
    currentPath === '/ministries' || currentPath.startsWith('/ministries/');
  const [open, setOpen] = useState(isSectionActive);

  useEffect(() => {
    if (isSectionActive) setOpen(true);
  }, [isSectionActive]);

  if (ministries.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="sidebar-ministries-list"
        className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isSectionActive
            ? 'bg-white/15 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        <NavIconGlyph icon="layers" />
        <span className="flex-1 text-left">Ministries</span>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <ul id="sidebar-ministries-list" className="ml-4 space-y-0.5 border-l border-white/10 pl-2">
          {ministries.map((ministry) => {
            const href = `/ministries/${ministry.slug}`;
            const active =
              currentPath === href || currentPath.startsWith(`${href}/`);

            return (
              <li key={ministry.slug}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-[40px] items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-white/15 font-medium text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="truncate">{ministry.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
