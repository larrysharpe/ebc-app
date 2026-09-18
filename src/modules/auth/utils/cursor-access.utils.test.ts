import { describe, expect, it } from 'vitest';

import { canEditAppViaCursor } from '@/modules/auth/utils/cursor-access.utils';

describe('canEditAppViaCursor', () => {
  it('allows only the webmaster role', () => {
    expect(canEditAppViaCursor('webmaster')).toBe(true);
    expect(canEditAppViaCursor(['webmaster', 'pastor'])).toBe(true);
  });

  it('denies super_admin, admin, and other staff without webmaster', () => {
    expect(canEditAppViaCursor('super_admin')).toBe(false);
    expect(canEditAppViaCursor('admin')).toBe(false);
    expect(canEditAppViaCursor(['pastor', 'office_staff'])).toBe(false);
  });
});
