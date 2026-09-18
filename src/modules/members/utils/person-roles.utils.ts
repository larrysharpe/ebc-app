import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import type { UserRole } from '@/modules/auth/types/auth.types';

import {
  JUNIOR_MEMBER_ASSIGNABLE_ROLES,
  MEMBER_DIRECTORY_ASSIGNABLE_ROLES,
  type MemberDirectoryAssignableRole,
} from '../constants/member-roles.constants';
import { MEMBERSHIP_STATUSES, type MembershipStatus, type Person } from '../types';
import { isJuniorMember } from './person-minor.utils';

/** Labels for the directory Roles column: membership + app roles. */
export function formatDirectoryRoleLabels(input: {
  membershipStatus: MembershipStatus;
  roles: readonly UserRole[];
}): string[] {
  const labels: string[] = [MEMBERSHIP_STATUSES[input.membershipStatus]];
  for (const role of input.roles) {
    const label = ROLE_LABELS[role];
    if (label && !labels.includes(label)) {
      labels.push(label);
    }
  }
  return labels;
}

export function assignableRolesForPerson(
  person: Pick<Person, 'dateOfBirth'>,
): readonly MemberDirectoryAssignableRole[] {
  if (isJuniorMember(person)) {
    return JUNIOR_MEMBER_ASSIGNABLE_ROLES;
  }
  return MEMBER_DIRECTORY_ASSIGNABLE_ROLES;
}

export function availableDirectoryRolesToAdd(
  currentRoles: readonly UserRole[],
  person?: Pick<Person, 'dateOfBirth'>,
): MemberDirectoryAssignableRole[] {
  const held = new Set(currentRoles);
  const pool = person
    ? assignableRolesForPerson(person)
    : MEMBER_DIRECTORY_ASSIGNABLE_ROLES;
  return pool.filter((role) => !held.has(role));
}

export function isRoleAllowedForPerson(
  person: Pick<Person, 'dateOfBirth'>,
  role: MemberDirectoryAssignableRole,
): boolean {
  return assignableRolesForPerson(person).includes(role);
}
