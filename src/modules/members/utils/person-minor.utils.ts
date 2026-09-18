import type { Person } from '../types';

/** Under this age → no app login. */
export const APP_ACCESS_MIN_AGE = 13;

/** Under this age → minor for privacy / guardian contact. */
export const LEGAL_MINOR_AGE = 18;

/** Age in whole years from an ISO date, or null if invalid / future. */
export function ageFromDateOfBirth(
  dateOfBirth: string | undefined,
  today = new Date(),
): number | null {
  if (!dateOfBirth) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const birth = new Date(year, month - 1, day);
  if (Number.isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }
  if (age < 0) return null;
  return age;
}

/** Under 18 from birthday. Falls back to stored isMinor when birthday is unknown. */
export function isPersonMinor(
  person: Pick<Person, 'isMinor' | 'dateOfBirth'>,
  today = new Date(),
): boolean {
  const age = ageFromDateOfBirth(person.dateOfBirth, today);
  if (age !== null) return age < LEGAL_MINOR_AGE;
  return person.isMinor;
}

/**
 * Junior member: ages 13–17 (birthday required).
 * Eligible for limited app roles (choir/band/volunteer).
 */
export function isJuniorMember(
  person: Pick<Person, 'dateOfBirth'>,
  today = new Date(),
): boolean {
  const age = ageFromDateOfBirth(person.dateOfBirth, today);
  if (age === null) return false;
  return age >= APP_ACCESS_MIN_AGE && age < LEGAL_MINOR_AGE;
}

/**
 * May receive an app login / directory role.
 * - Birthday known: age ≥ 13
 * - Birthday unknown: allowed only when not flagged minor (assume adult)
 */
export function canHaveAppAccess(
  person: Pick<Person, 'isMinor' | 'dateOfBirth'>,
  today = new Date(),
): boolean {
  const age = ageFromDateOfBirth(person.dateOfBirth, today);
  if (age !== null) return age >= APP_ACCESS_MIN_AGE;
  return !person.isMinor;
}

/** Derive stored isMinor from birthday (under 18). Unknown birthday → false. */
export function deriveIsMinorFromBirthday(
  dateOfBirth: string | undefined,
  today = new Date(),
): boolean {
  const age = ageFromDateOfBirth(dateOfBirth, today);
  return age !== null && age < LEGAL_MINOR_AGE;
}

export type AgeBadge = 'child' | 'junior' | null;

/** Directory badge: Child (&lt;13), Junior (13–17), or none. */
export function personAgeBadge(
  person: Pick<Person, 'isMinor' | 'dateOfBirth'>,
  today = new Date(),
): AgeBadge {
  const age = ageFromDateOfBirth(person.dateOfBirth, today);
  if (age !== null) {
    if (age < APP_ACCESS_MIN_AGE) return 'child';
    if (age < LEGAL_MINOR_AGE) return 'junior';
    return null;
  }
  if (person.isMinor) return 'child';
  return null;
}
