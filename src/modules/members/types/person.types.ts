import type { UserRole } from '@/modules/auth/types/auth.types';

export const MEMBERSHIP_STATUSES = {
  visitor: 'Visitor',
  attender: 'Attender',
  member: 'Member',
  /** Paid musicians / contractors — in the directory, not church members. */
  hired: 'Hired',
  inactive: 'Inactive',
} as const;

export type MembershipStatus = keyof typeof MEMBERSHIP_STATUSES;

/** Common name suffixes — free text still allowed via forms. */
export const NAME_SUFFIX_OPTIONS = [
  'Jr.',
  'Sr.',
  'II',
  'III',
  'IV',
  'V',
] as const;

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  suffix?: string;
  email?: string;
  phone?: string;
  /** ISO date YYYY-MM-DD. */
  dateOfBirth?: string;
  /** Kids/youth — Person record without typical adult contact/login. */
  isMinor: boolean;
  membershipStatus: MembershipStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/** Directory row with app roles resolved from a matching user account (by email). */
export type DirectoryPerson = Person & {
  roles: UserRole[];
  /** Ministry leader scope IDs from the linked user account (if any). */
  ministryIds: string[];
  /** Choir director scope IDs from the linked user account (if any). */
  choirIds: string[];
};

export function personDisplayName(
  person: Pick<Person, 'firstName' | 'lastName' | 'suffix'>,
): string {
  const base = `${person.firstName} ${person.lastName}`.trim();
  const suffix = person.suffix?.trim();
  return suffix ? `${base} ${suffix}` : base;
}
