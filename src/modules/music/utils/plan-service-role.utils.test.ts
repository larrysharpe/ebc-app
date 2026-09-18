import { describe, expect, it } from 'vitest';

import {
  formatPlanServiceRole,
  isPlanServiceRoleNa,
  normalizePlanServiceRoleInput,
  PLAN_SERVICE_ROLE_NA,
  planServiceRolesCallout,
} from './plan-service-role.utils';

describe('plan-service-role.utils', () => {
  it('detects N/A values case-insensitively', () => {
    expect(isPlanServiceRoleNa('N/A')).toBe(true);
    expect(isPlanServiceRoleNa('n/a')).toBe(true);
    expect(isPlanServiceRoleNa('Sister Ann')).toBe(false);
    expect(isPlanServiceRoleNa(null)).toBe(false);
  });

  it('formats blank vs N/A vs name', () => {
    expect(formatPlanServiceRole(null)).toBe('_____________________________');
    expect(formatPlanServiceRole('N/A')).toBe(PLAN_SERVICE_ROLE_NA);
    expect(formatPlanServiceRole('Deacon Jones')).toBe('Deacon Jones');
  });

  it('normalizes form input', () => {
    expect(normalizePlanServiceRoleInput('')).toBeNull();
    expect(normalizePlanServiceRoleInput('  n/a  ')).toBe(PLAN_SERVICE_ROLE_NA);
    expect(normalizePlanServiceRoleInput('  Ann  ')).toBe('Ann');
  });

  it('builds volunteer callout from N/A flags', () => {
    expect(planServiceRolesCallout(null, null)).toBe(
      'I need someone to read the scripture and prayer.',
    );
    expect(planServiceRolesCallout(PLAN_SERVICE_ROLE_NA, null)).toBe(
      'I need someone for prayer.',
    );
    expect(planServiceRolesCallout(null, PLAN_SERVICE_ROLE_NA)).toBe(
      'I need someone to read the scripture.',
    );
    expect(
      planServiceRolesCallout(PLAN_SERVICE_ROLE_NA, PLAN_SERVICE_ROLE_NA),
    ).toBeNull();
  });
});
