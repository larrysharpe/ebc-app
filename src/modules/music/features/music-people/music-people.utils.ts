import type { UserRole } from '@/modules/auth/types/auth.types';
import type { DirectoryPerson } from '@/modules/members/types';

import {
  MUSIC_MANAGEABLE_ROLES,
  type MusicManageableRole,
} from '../../schemas/music-people.schemas';

export type MusicRoleGroup = {
  role: MusicManageableRole;
  people: DirectoryPerson[];
};

export function isMusicManageableRole(role: string): role is MusicManageableRole {
  return (MUSIC_MANAGEABLE_ROLES as readonly string[]).includes(role);
}

export function musicManageableRolesOf(
  roles: readonly UserRole[],
): MusicManageableRole[] {
  return roles.filter(isMusicManageableRole);
}

/** Group directory people under each manageable music role (a person may appear in several). */
export function groupPeopleByMusicRole(
  people: readonly DirectoryPerson[],
): MusicRoleGroup[] {
  return MUSIC_MANAGEABLE_ROLES.map((role) => ({
    role,
    people: people
      .filter((person) => person.roles.includes(role))
      .slice()
      .sort((a, b) => {
        const last = a.lastName.localeCompare(b.lastName);
        return last !== 0 ? last : a.firstName.localeCompare(b.firstName);
      }),
  }));
}

export function musicMinisters(
  people: readonly DirectoryPerson[],
): DirectoryPerson[] {
  return people
    .filter((person) => person.roles.includes('music_minister'))
    .slice()
    .sort((a, b) => {
      const last = a.lastName.localeCompare(b.lastName);
      return last !== 0 ? last : a.firstName.localeCompare(b.firstName);
    });
}
