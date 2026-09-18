import { describe, expect, it } from 'vitest';

import { buildSeedPersonEmail } from './person-seed-email.utils';

describe('buildSeedPersonEmail', () => {
  it('builds first.last@domain', () => {
    expect(
      buildSeedPersonEmail({
        firstName: 'Eugene',
        lastName: 'Short',
        id: 'person-1ad10b6c-5',
        takenEmails: new Set(),
      }),
    ).toBe('eugene.short@ebenezerbc.org');
  });

  it('strips TBD parentheses', () => {
    expect(
      buildSeedPersonEmail({
        firstName: 'Jay',
        lastName: '(TBD)',
        id: 'person-6943bef5-b',
        takenEmails: new Set(),
      }),
    ).toBe('jay.tbd@ebenezerbc.org');
  });

  it('adds id suffix when base email is taken', () => {
    expect(
      buildSeedPersonEmail({
        firstName: 'Jay',
        lastName: '(TBD)',
        id: 'person-6943bef5-b',
        takenEmails: new Set(['jay.tbd@ebenezerbc.org']),
      }),
    ).toBe('jay.tbd.6943bef5@ebenezerbc.org');
  });
});
