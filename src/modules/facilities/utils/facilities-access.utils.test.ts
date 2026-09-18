import { describe, expect, it } from 'vitest';

import { canManageFacilities } from '@/modules/facilities/utils/facilities-access.utils';

describe('facilities-access.utils', () => {
  it('allows facility managers and office staff', () => {
    expect(canManageFacilities('facility_manager')).toBe(true);
    expect(canManageFacilities('office_staff')).toBe(true);
    expect(canManageFacilities(['trustee'])).toBe(true);
  });

  it('denies roles without facilities access', () => {
    expect(canManageFacilities('volunteer')).toBe(false);
    expect(canManageFacilities('choir_member')).toBe(false);
    expect(canManageFacilities('ministry_leader')).toBe(false);
  });
});
