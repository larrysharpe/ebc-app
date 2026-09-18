import Link from 'next/link';
import Image from 'next/image';
import { Fragment } from 'react';

import { canAccessRoute } from '@/modules/auth/utils/route-access.utils';
import { NavIconGlyph } from './NavIconGlyph';
import { SidebarChurchLifeSection } from './SidebarChurchLifeSection';
import { SidebarMinistriesSection } from './SidebarMinistriesSection';
import type { NavItemProps, SidebarProps } from './Sidebar.types';
import { type NavChildItem } from './sidebar.constants';
import { getNavItemsForRoles } from './sidebar-nav.utils';
import { LegalLinks } from '@/modules/legal';
import { LOGO_ALT, LOGO_URL } from '@/lib/church';

function NavItem({ href, label, icon, available, active, onNavigate }: NavItemProps) {
  const base =
    'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors';
  const activeClass = active
    ? 'bg-white/15 text-white'
    : available
      ? 'text-white/80 hover:bg-white/10 hover:text-white'
      : 'cursor-not-allowed text-white/40';

  if (!available) {
    return (
      <span className={`${base} ${activeClass}`} title="Coming soon">
        <NavIconGlyph icon={icon} />
        <span className="flex-1">{label}</span>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} ${activeClass}`}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
    >
      <NavIconGlyph icon={icon} />
      {label}
    </Link>
  );
}

function activeNavChildHref(
  currentPath: string,
  items: readonly NavChildItem[],
): string | null {
  const matches = items.filter(
    (child) =>
      currentPath === child.href || currentPath.startsWith(`${child.href}/`),
  );
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}

function NavChildLinks({
  items,
  currentPath,
  userRoles,
  onNavigate,
}: {
  items: readonly NavChildItem[];
  currentPath: string;
  userRoles: SidebarProps['userRoles'];
  onNavigate?: () => void;
}) {
  const visible = items.filter((child) => canAccessRoute(userRoles, child.href));
  if (visible.length === 0) return null;

  const activeHref = activeNavChildHref(currentPath, visible);

  return (
    <ul className="ml-4 space-y-0.5 border-l border-white/10 pl-2">
      {visible.map((child) => {
        const active = child.href === activeHref;

        return (
          <li key={child.href}>
            <Link
              href={child.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-base transition-colors ${
                active
                  ? 'bg-white/15 font-medium text-white'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="truncate">{child.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ministriesInsertAfter(visibleHrefs: string[]): string | null {
  if (visibleHrefs.includes('/visitors')) return '/visitors';
  if (visibleHrefs.includes('/')) return '/';
  return null;
}

function isNavItemActive(href: string, currentPath: string): boolean {
  if (href === '/') return currentPath === '/';
  if (href === '/settings') {
    return currentPath === '/settings' || currentPath.startsWith('/settings/');
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function MinistryOnlyNav({
  ministries,
  currentPath,
  onNavigate,
}: {
  ministries: SidebarProps['ministries'];
  currentPath: string;
  onNavigate?: () => void;
}) {
  if (ministries.length === 0) return null;

  if (ministries.length === 1) {
    const ministry = ministries[0];
    if (!ministry) return null;
    const href = `/ministries/${ministry.slug}`;
    return (
      <NavItem
        href={href}
        label={ministry.name}
        icon="layers"
        available
        active={currentPath === href || currentPath.startsWith(`${href}/`)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <SidebarMinistriesSection
      ministries={ministries}
      currentPath={currentPath}
      onNavigate={onNavigate}
    />
  );
}

export function Sidebar({
  currentPath,
  userRoles,
  ministries,
  ministryOnlyNav = false,
  className = '',
  onNavigate,
  ariaHidden,
  showChurchLifeLinks = false,
}: SidebarProps) {
  const ministryList = ministries ?? [];
  const navItems = getNavItemsForRoles(userRoles);
  const visibleItems = ministryOnlyNav
    ? []
    : navItems.filter((item) => canAccessRoute(userRoles, item.href));
  const insertAfter = ministriesInsertAfter(visibleItems.map((item) => item.href));

  return (
    <aside
      className={`flex h-full max-h-[100dvh] flex-col overflow-hidden ${className}`}
      aria-hidden={ariaHidden}
    >
      <div className="shrink-0 border-b border-white/10 px-4 py-4">
        <div className="rounded-lg bg-white px-3 py-2">
          <Image
            src={LOGO_URL}
            alt={LOGO_ALT}
            width={200}
            height={56}
            className="h-10 w-auto max-w-full"
            priority
          />
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white/70">
          Staff Portal
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
        {showChurchLifeLinks ? (
          <SidebarChurchLifeSection onNavigate={onNavigate} />
        ) : null}
        {ministryOnlyNav ? (
          <MinistryOnlyNav
            ministries={ministryList}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ) : (
          visibleItems.map((item) => (
            <Fragment key={item.href}>
              <div className="space-y-0.5">
                <NavItem
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  available={item.available}
                  active={isNavItemActive(item.href, currentPath)}
                  onNavigate={onNavigate}
                />
                {item.children && item.available ? (
                  <NavChildLinks
                    items={item.children}
                    currentPath={currentPath}
                    userRoles={userRoles}
                    onNavigate={onNavigate}
                  />
                ) : null}
              </div>
              {item.href === insertAfter && ministryList.length > 0 ? (
                <SidebarMinistriesSection
                  ministries={ministryList}
                  currentPath={currentPath}
                  onNavigate={onNavigate}
                />
              ) : null}
            </Fragment>
          ))
        )}
      </nav>

      <div className="shrink-0 border-t border-white/10 px-4 py-4">
        <LegalLinks variant="onDark" />
      </div>
    </aside>
  );
}
