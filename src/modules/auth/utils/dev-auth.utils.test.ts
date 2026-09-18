import { describe, expect, it } from 'vitest';

import { isDevAuthEnabled } from '@/modules/auth/utils/dev-auth.utils';

describe('isDevAuthEnabled', () => {
  it('is true in the test environment', () => {
    expect(isDevAuthEnabled()).toBe(process.env.NODE_ENV === 'development');
  });
});
