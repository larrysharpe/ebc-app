import type { UserRole } from '@/modules/auth/types/auth.types';
import { canAccessRoute } from '@/modules/auth/utils/route-access.utils';
import { hasPermission } from '@/modules/auth/utils/permissions.utils';

import { NAV_ITEMS, type NavChildItem, type NavItemConfig } from './sidebar.constants';

function musicNavChildren(roles: readonly UserRole[]): NavChildItem[] {
  const children: NavChildItem[] = [];

  if (canAccessRoute(roles, '/music/plans') && hasPermission(roles, 'music.plans.edit')) {
    children.push({ href: '/music/plans', label: 'Choir plans' });
  }
  if (canAccessRoute(roles, '/music/songs')) {
    children.push({ href: '/music/songs', label: 'Songs' });
  }
  if (canAccessRoute(roles, '/music/choirs')) {
    children.push({
      href: '/music/choirs',
      label: hasPermission(roles, 'music.rotation.manage') ? 'Choir setup' : 'My choirs',
    });
  }
  if (canAccessRoute(roles, '/music/band')) {
    children.push({ href: '/music/band', label: 'Band' });
  }
  if (canAccessRoute(roles, '/music/song-requests')) {
    children.push({ href: '/music/song-requests', label: 'Song requests' });
  }
  if (canAccessRoute(roles, '/music/people')) {
    children.push({ href: '/music/people', label: 'Music people' });
  }
  if (canAccessRoute(roles, '/music/musician-intake')) {
    children.push({ href: '/music/musician-intake', label: 'New musicians' });
  }
  if (canAccessRoute(roles, '/music/director-settings')) {
    children.push({ href: '/music/director-settings', label: 'Director settings' });
  }

  return children;
}

function eventsNavChildren(roles: readonly UserRole[]): NavChildItem[] {
  const children: NavChildItem[] = [];
  if (canAccessRoute(roles, '/events')) {
    children.push({ href: '/events', label: 'Calendar' });
  }
  if (canAccessRoute(roles, '/events/services')) {
    children.push({ href: '/events/services', label: 'Sunday services' });
  }
  return children;
}

/** Role-aware nav: job-first children, plain labels. */
export function getNavItemsForRoles(roles: readonly UserRole[]): readonly NavItemConfig[] {
  return NAV_ITEMS.map((item) => {
    if (item.href === '/music') {
      return { ...item, children: musicNavChildren(roles) };
    }
    if (item.href === '/events') {
      return { ...item, children: eventsNavChildren(roles) };
    }
    return item;
  });
}
