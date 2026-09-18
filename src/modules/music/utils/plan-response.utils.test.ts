import { describe, expect, it } from 'vitest';

import {
  isPlanAttendanceStatus,
  summarizePlanAttendance,
} from './plan-response.utils';

describe('plan-response.utils', () => {
  it('detects attendance statuses', () => {
    expect(isPlanAttendanceStatus('attending')).toBe(true);
    expect(isPlanAttendanceStatus('nope')).toBe(false);
  });

  it('counts each status', () => {
    expect(
      summarizePlanAttendance([
        { status: 'attending' },
        { status: 'attending' },
        { status: 'maybe' },
        { status: 'not_attending' },
      ]),
    ).toEqual({
      attending: 2,
      not_attending: 1,
      maybe: 1,
      total: 4,
    });
  });
});
