import { describe, expect, it } from 'vitest';

import {
  canAccessMinistrySlug,
  canApproveMinistrySop,
  canManageMinistry,
  filterMinistriesForUser,
  isMinistryOnlyLeader,
  isPlatformAdmin,
  isScopedMinistryLeader,
} from '@/modules/auth/utils/ministry-scope.utils';
import { canAccessRoute } from '@/modules/auth/utils/route-access.utils';

describe('isPlatformAdmin', () => {
  it('includes super_admin and admin', () => {
    expect(isPlatformAdmin('super_admin')).toBe(true);
    expect(isPlatformAdmin('admin')).toBe(true);
    expect(isPlatformAdmin('pastor')).toBe(false);
  });

  it('returns true when any role is platform admin', () => {
    expect(isPlatformAdmin(['deacon', 'admin'])).toBe(true);
    expect(isPlatformAdmin(['deacon', 'choir_member'])).toBe(false);
  });
});

describe('ministry scope', () => {
  const youthLeader = { roles: ['ministry_leader'] as const, ministryIds: ['min-youth'] };
  const mediaLeader = { roles: ['ministry_leader'] as const, ministryIds: ['min-media'] };
  const multiLeader = {
    roles: ['deacon', 'choir_member', 'ministry_leader'] as const,
    ministryIds: ['min-jamm'],
  };

  it('limits ministry leaders to their ministry slug', () => {
    expect(canAccessMinistrySlug(youthLeader, 'youth-ministry')).toBe(true);
    expect(canAccessMinistrySlug(youthLeader, 'media-ministry')).toBe(false);
    expect(canAccessMinistrySlug(mediaLeader, 'media-ministry')).toBe(true);
  });

  it('lets office staff access any ministry', () => {
    expect(
      canAccessMinistrySlug({ roles: ['office_staff'], ministryIds: [] }, 'youth-ministry'),
    ).toBe(true);
  });

  it('filters ministry list for scoped leaders', () => {
    const ministries = [
      { id: 'min-youth', name: 'Youth' },
      { id: 'min-media', name: 'Media' },
    ];
    expect(filterMinistriesForUser(youthLeader, ministries)).toHaveLength(1);
    expect(filterMinistriesForUser(youthLeader, ministries)[0]?.id).toBe('min-youth');
  });

  it('allows manage on own ministry only', () => {
    expect(canManageMinistry(youthLeader, 'min-youth')).toBe(true);
    expect(canManageMinistry(youthLeader, 'min-media')).toBe(false);
    expect(canManageMinistry({ roles: ['office_staff'], ministryIds: [] }, 'min-media')).toBe(true);
  });

  it('limits SOP approval to pastor and admins', () => {
    expect(canApproveMinistrySop('pastor')).toBe(true);
    expect(canApproveMinistrySop('admin')).toBe(true);
    expect(canApproveMinistrySop('super_admin')).toBe(true);
    expect(canApproveMinistrySop('office_staff')).toBe(false);
    expect(canApproveMinistrySop(youthLeader)).toBe(false);
  });

  it('unions access across multiple roles', () => {
    expect(canAccessMinistrySlug(multiLeader, 'jamm')).toBe(true);
    expect(canAccessRoute(multiLeader, '/music/plans')).toBe(true);
    expect(canAccessRoute(multiLeader, '/')).toBe(true);
  });

  it('treats sole ministry_leader with assignments as ministry-only', () => {
    expect(isMinistryOnlyLeader(youthLeader)).toBe(true);
    expect(isScopedMinistryLeader(youthLeader)).toBe(true);
    expect(isMinistryOnlyLeader(multiLeader)).toBe(false);
    expect(isScopedMinistryLeader(multiLeader)).toBe(true);
    expect(
      isMinistryOnlyLeader({ roles: ['ministry_leader'], ministryIds: [] }),
    ).toBe(false);
  });
});

describe('canAccessRoute with ministry scope', () => {
  it('blocks ministry leaders from other ministry pages', () => {
    expect(
      canAccessRoute(
        { roles: ['ministry_leader'], ministryIds: ['min-youth'] },
        '/ministries/media-ministry',
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        { roles: ['ministry_leader'], ministryIds: ['min-youth'] },
        '/ministries/youth-ministry',
      ),
    ).toBe(true);
  });

  it('allows super_admin everywhere', () => {
    expect(canAccessRoute({ roles: ['super_admin'], ministryIds: [] }, '/settings')).toBe(true);
    expect(canAccessRoute({ roles: ['super_admin'], ministryIds: [] }, '/visitors')).toBe(true);
  });
});
