import type { Person } from './person.types';

export const HOUSEHOLD_ROLES = {
  head: 'Head',
  spouse: 'Spouse',
  child: 'Child',
  other: 'Other',
} as const;

export type HouseholdRole = keyof typeof HOUSEHOLD_ROLES;

export type Household = {
  id: string;
  name: string;
  primaryPhone?: string;
  primaryEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type HouseholdMember = {
  id: string;
  householdId: string;
  personId: string;
  role: HouseholdRole;
  person: Person;
  createdAt: string;
  updatedAt: string;
};

export type HouseholdDetail = Household & {
  members: HouseholdMember[];
};

export const HOUSEHOLD_ROLE_ORDER: HouseholdRole[] = [
  'head',
  'spouse',
  'child',
  'other',
];
