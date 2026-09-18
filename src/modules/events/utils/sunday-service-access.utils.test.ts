import { describe, expect, it } from 'vitest';

import { canManageSundayServices } from './sunday-service-access.utils';

describe('canManageSundayServices', () => {
  it('allows office and pastoral roles', () => {
    expect(canManageSundayServices('pastor')).toBe(true);
    expect(canManageSundayServices('office_staff')).toBe(true);
    expect(canManageSundayServices('admin')).toBe(true);
  });

  it('denies choir-only roles', () => {
    expect(canManageSundayServices('choir_director')).toBe(false);
    expect(canManageSundayServices('choir_member')).toBe(false);
  });
});
