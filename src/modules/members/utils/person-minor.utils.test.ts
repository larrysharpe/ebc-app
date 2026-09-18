import { describe, expect, it } from 'vitest';

import {
  ageFromDateOfBirth,
  canHaveAppAccess,
  deriveIsMinorFromBirthday,
  isJuniorMember,
  isPersonMinor,
  personAgeBadge,
} from './person-minor.utils';

describe('person-minor.utils', () => {
  const today = new Date('2026-07-18T12:00:00');

  it('computes age from birthday', () => {
    expect(ageFromDateOfBirth('2015-07-18', today)).toBe(11);
    expect(ageFromDateOfBirth('2015-07-19', today)).toBe(10);
    expect(ageFromDateOfBirth('bad', today)).toBeNull();
  });

  it('treats under-18 birthday as minor', () => {
    expect(
      isPersonMinor({ isMinor: false, dateOfBirth: '2012-01-01' }, today),
    ).toBe(true);
    expect(
      isPersonMinor({ isMinor: false, dateOfBirth: '2000-01-01' }, today),
    ).toBe(false);
  });

  it('allows app access from age 13', () => {
    // 12
    expect(
      canHaveAppAccess({ isMinor: false, dateOfBirth: '2014-07-18' }, today),
    ).toBe(false);
    // 13
    expect(
      canHaveAppAccess({ isMinor: false, dateOfBirth: '2013-07-18' }, today),
    ).toBe(true);
    // adult, no birthday
    expect(canHaveAppAccess({ isMinor: false }, today)).toBe(true);
    // household child, no birthday
    expect(canHaveAppAccess({ isMinor: true }, today)).toBe(false);
  });

  it('identifies junior members (13–17)', () => {
    expect(isJuniorMember({ dateOfBirth: '2013-07-18' }, today)).toBe(true); // 13
    expect(isJuniorMember({ dateOfBirth: '2009-07-18' }, today)).toBe(true); // 17
    expect(isJuniorMember({ dateOfBirth: '2008-07-18' }, today)).toBe(false); // 18
    expect(isJuniorMember({ dateOfBirth: '2014-07-18' }, today)).toBe(false); // 12
    expect(isJuniorMember({ dateOfBirth: '2000-01-01' }, today)).toBe(false);
  });

  it('returns age badges for directory', () => {
    expect(personAgeBadge({ isMinor: false, dateOfBirth: '2015-01-01' }, today)).toBe(
      'child',
    );
    expect(personAgeBadge({ isMinor: false, dateOfBirth: '2012-01-01' }, today)).toBe(
      'junior',
    );
    expect(personAgeBadge({ isMinor: false, dateOfBirth: '2000-01-01' }, today)).toBe(
      null,
    );
  });

  it('derives isMinor from birthday for persistence', () => {
    expect(deriveIsMinorFromBirthday('2015-01-01', today)).toBe(true);
    expect(deriveIsMinorFromBirthday('2000-01-01', today)).toBe(false);
    expect(deriveIsMinorFromBirthday(undefined, today)).toBe(false);
  });
});
