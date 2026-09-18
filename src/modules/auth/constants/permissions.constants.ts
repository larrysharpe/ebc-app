import type { Permission, PermissionRule } from '@/modules/auth/types/permissions.types';
import type { UserRole } from '@/modules/auth/types/auth.types';

/**
 * Choir branch: music minister → choir director → choir member
 * Band branch:  music minister → band director → band member
 *
 * Higher index = more authority within that branch.
 */
export const CHOIR_ROLE_HIERARCHY = [
  'choir_member',
  'choir_director',
  'music_minister',
] as const;

export const BAND_ROLE_HIERARCHY = [
  'band_member',
  'band_director',
  'music_minister',
] as const;

export type ChoirHierarchyRole = (typeof CHOIR_ROLE_HIERARCHY)[number];
export type BandHierarchyRole = (typeof BAND_ROLE_HIERARCHY)[number];

export const PERMISSIONS = {
  'music.view': { kind: 'music_any' },
  'music.plans.view': { kind: 'hierarchy', hierarchy: 'choir', minRole: 'choir_member' },
  'music.plans.edit': { kind: 'hierarchy', hierarchy: 'choir', minRole: 'choir_director' },
  'music.plans.send': { kind: 'hierarchy', hierarchy: 'choir', minRole: 'choir_director' },
  'music.songs.view': { kind: 'hierarchy', hierarchy: 'choir', minRole: 'choir_member' },
  'music.songs.pick': { kind: 'hierarchy', hierarchy: 'choir', minRole: 'choir_director' },
  /** Submit a song for the catalog / repertoire. */
  'music.songs.request': { kind: 'hierarchy', hierarchy: 'choir', minRole: 'choir_member' },
  /** Approve/decline song requests and add them to the catalog. */
  'music.songs.manage': { kind: 'hierarchy', hierarchy: 'choir', minRole: 'choir_director' },
  'music.band.view': { kind: 'hierarchy', hierarchy: 'band', minRole: 'band_member' },
  'music.band.manage': { kind: 'hierarchy', hierarchy: 'band', minRole: 'band_director' },
  /** Default rotation + date swaps — Music Minister (+ platform admins). */
  'music.rotation.manage': { kind: 'hierarchy', hierarchy: 'choir', minRole: 'music_minister' },
  /** Assign choir/band directors and members — Music Minister (+ platform admins). */
  'music.people.manage': { kind: 'hierarchy', hierarchy: 'choir', minRole: 'music_minister' },
  /** Musician intake / pay paperwork → roster — band director+ (includes Music Minister). */
  'music.intake.manage': { kind: 'hierarchy', hierarchy: 'band', minRole: 'band_director' },
} as const satisfies Record<Permission, PermissionRule>;

/** Routes that need a specific permission beyond module route access. */
export const ROUTE_PERMISSIONS: Partial<Record<string, Permission>> = {
  '/music/plans/new': 'music.plans.edit',
  '/music/plans': 'music.plans.view',
  '/music/songs': 'music.songs.view',
  '/music/song-requests': 'music.songs.manage',
  '/music/band': 'music.band.view',
  '/music/director-settings': 'music.plans.edit',
  '/music/people': 'music.people.manage',
  '/music/musician-intake': 'music.intake.manage',
};

export const MUSIC_MODULE_ROLES: UserRole[] = [
  'music_minister',
  'choir_director',
  'choir_member',
  'band_director',
  'band_member',
];
