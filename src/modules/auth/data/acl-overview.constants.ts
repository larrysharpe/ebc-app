import { ROUTE_ACCESS } from '@/modules/auth/constants/auth.constants';
import { PERMISSIONS } from '@/modules/auth/constants/permissions.constants';
import {
  BAND_ROLE_HIERARCHY,
  CHOIR_ROLE_HIERARCHY,
} from '@/modules/auth/constants/permissions.constants';
import type { AclPermissionRow, AclRouteRow } from '@/modules/auth/types/user-admin.types';

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/visitors': 'Visitors',
  '/ministries': 'Ministries',
  '/music': 'Music',
  '/events': 'Events',
  '/leadership': 'Leadership',
  '/giving': 'Giving',
  '/trustees': 'Trustees',
  '/social': 'Social',
  '/settings': 'Settings',
  '/church': 'Church life (all users)',
};

const PERMISSION_LABELS: Record<keyof typeof PERMISSIONS, { label: string; description: string }> = {
  'music.view': {
    label: 'View music',
    description: 'Music home and chapel choir rotation',
  },
  'music.plans.view': { label: 'View choir plans', description: 'Choir branch — read plans' },
  'music.plans.edit': { label: 'Edit choir plans', description: 'Choir director and above' },
  'music.plans.send': { label: 'Send plans', description: 'Choir director and above' },
  'music.songs.view': { label: 'View song catalog', description: 'Choir branch' },
  'music.songs.pick': { label: 'Pick songs for plans', description: 'Choir director and above' },
  'music.songs.request': {
    label: 'Request songs',
    description: 'Choir members — suggest songs for the repertoire',
  },
  'music.songs.manage': {
    label: 'Manage song requests',
    description: 'Choir director and above — approve into catalog',
  },
  'music.band.view': { label: 'View band roster', description: 'Band branch' },
  'music.band.manage': { label: 'Manage band roster', description: 'Band director and above' },
  'music.rotation.manage': {
    label: 'Manage choir rotation',
    description: 'Music Minister — defaults and schedule swaps',
  },
  'music.people.manage': {
    label: 'Manage music people',
    description: 'Music Minister — directors and members',
  },
  'music.intake.manage': {
    label: 'Musician intake',
    description: 'Band director and above — signup / pay paperwork → roster',
  },
};

export function getAclRouteRows(): AclRouteRow[] {
  return Object.entries(ROUTE_ACCESS)
    .filter(([route]) => route !== '/')
    .map(([route, roles]) => ({
      route,
      label: ROUTE_LABELS[route] ?? route,
      roles: [...roles],
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getAclPermissionRows(): AclPermissionRow[] {
  return (Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]).map((permission) => ({
    permission,
    label: PERMISSION_LABELS[permission].label,
    description: PERMISSION_LABELS[permission].description,
  }));
}

export const MUSIC_HIERARCHY_OVERVIEW = {
  choir: CHOIR_ROLE_HIERARCHY,
  band: BAND_ROLE_HIERARCHY,
} as const;
