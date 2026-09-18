import type { UserRole } from '@/modules/auth/types/auth.types';

/** Roles that can be assigned from the members directory (not platform roles). */
export const MEMBER_DIRECTORY_ASSIGNABLE_ROLES = [
  'pastor',
  'office_staff',
  'finance',
  'trustee',
  'deacon',
  'music_minister',
  'choir_director',
  'choir_member',
  'band_director',
  'band_member',
  'social_manager',
  'ministry_leader',
  'volunteer',
] as const satisfies readonly UserRole[];

export type MemberDirectoryAssignableRole =
  (typeof MEMBER_DIRECTORY_ASSIGNABLE_ROLES)[number];

/**
 * Roles junior members (ages 13–17) may receive.
 * Leadership / staff / finance roles stay adult-only.
 */
export const JUNIOR_MEMBER_ASSIGNABLE_ROLES = [
  'choir_member',
  'band_member',
  'volunteer',
] as const satisfies readonly MemberDirectoryAssignableRole[];

export type JuniorMemberAssignableRole =
  (typeof JUNIOR_MEMBER_ASSIGNABLE_ROLES)[number];
