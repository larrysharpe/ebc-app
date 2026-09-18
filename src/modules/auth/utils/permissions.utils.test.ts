import { describe, expect, it } from 'vitest';

import { canAccessRoute } from '@/modules/auth/utils/route-access.utils';
import { getMusicAccess, hasPermission, normalizeRole } from '@/modules/auth/utils/permissions.utils';

describe('normalizeRole', () => {
  it('maps legacy roles', () => {
    expect(normalizeRole('music_director')).toBe('music_minister');
    expect(normalizeRole('musician')).toBe('band_member');
  });
});

describe('music hierarchy permissions', () => {
  it('lets choir directors pick songs but not choir members', () => {
    expect(hasPermission('choir_director', 'music.songs.pick')).toBe(true);
    expect(hasPermission('choir_member', 'music.songs.pick')).toBe(false);
    expect(hasPermission('choir_member', 'music.plans.view')).toBe(true);
  });

  it('gives music minister full choir and band authority', () => {
    const access = getMusicAccess('music_minister');
    expect(access.canEditPlans).toBe(true);
    expect(access.canPickSongs).toBe(true);
    expect(access.canManageBand).toBe(true);
    expect(access.canManageRotation).toBe(true);
    expect(access.canManagePeople).toBe(true);
    expect(access.canManageIntake).toBe(true);
  });

  it('limits rotation and people management to music minister', () => {
    expect(hasPermission('choir_director', 'music.rotation.manage')).toBe(false);
    expect(hasPermission('choir_director', 'music.people.manage')).toBe(false);
    expect(hasPermission('band_director', 'music.intake.manage')).toBe(true);
    expect(hasPermission('band_member', 'music.intake.manage')).toBe(false);
  });

  it('unions permissions across multiple roles', () => {
    const access = getMusicAccess(['deacon', 'choir_member']);
    expect(access.canViewPlans).toBe(true);
    expect(access.canEditPlans).toBe(false);
    expect(hasPermission(['deacon', 'band_member'], 'music.band.view')).toBe(true);
  });

  it('keeps band and choir branches separate below music minister', () => {
    expect(hasPermission('band_director', 'music.band.manage')).toBe(true);
    expect(hasPermission('band_director', 'music.songs.pick')).toBe(false);
    expect(hasPermission('choir_director', 'music.songs.pick')).toBe(true);
    expect(hasPermission('choir_director', 'music.band.manage')).toBe(false);
  });

  it('blocks band members from choir plan routes', () => {
    expect(canAccessRoute('band_member', '/music/plans')).toBe(false);
    expect(canAccessRoute('band_member', '/music/band')).toBe(true);
    expect(canAccessRoute('choir_member', '/music/songs')).toBe(true);
    expect(canAccessRoute('choir_member', '/music/band')).toBe(false);
  });

  it('lets anyone with music module access open choir setup', () => {
    expect(canAccessRoute('band_member', '/music/choirs')).toBe(true);
    expect(canAccessRoute('choir_member', '/music/choirs')).toBe(true);
    expect(canAccessRoute('band_director', '/music/choirs')).toBe(true);
    expect(canAccessRoute('choir_director', '/music/choirs')).toBe(true);
    expect(canAccessRoute('webmaster', '/music/choirs')).toBe(true);
    expect(canAccessRoute('office_staff', '/music/choirs')).toBe(false);
  });

  it('requires choir director for new plan route', () => {
    expect(canAccessRoute('choir_member', '/music/plans/new')).toBe(false);
    expect(canAccessRoute('choir_director', '/music/plans/new')).toBe(true);
  });

  it('limits director settings to choir directors and above', () => {
    expect(canAccessRoute('choir_member', '/music/director-settings')).toBe(false);
    expect(canAccessRoute('band_member', '/music/director-settings')).toBe(false);
    expect(canAccessRoute('choir_director', '/music/director-settings')).toBe(true);
  });

  it('limits music people and intake routes', () => {
    expect(canAccessRoute('choir_director', '/music/people')).toBe(false);
    expect(canAccessRoute('music_minister', '/music/people')).toBe(true);
    expect(canAccessRoute('band_member', '/music/musician-intake')).toBe(false);
    expect(canAccessRoute('band_director', '/music/musician-intake')).toBe(true);
  });

  it('lets choir members request songs; directors manage the queue', () => {
    expect(hasPermission('choir_member', 'music.songs.request')).toBe(true);
    expect(hasPermission('choir_member', 'music.songs.manage')).toBe(false);
    expect(hasPermission('choir_director', 'music.songs.manage')).toBe(true);
    expect(getMusicAccess('choir_member').canRequestSongs).toBe(true);
    expect(getMusicAccess('choir_member').canManageSongs).toBe(false);
    expect(canAccessRoute('choir_member', '/music/song-requests')).toBe(false);
    expect(canAccessRoute('choir_director', '/music/song-requests')).toBe(true);
  });
});

describe('canAccessRoute', () => {
  it('allows admin and super_admin everywhere', () => {
    expect(canAccessRoute('admin', '/')).toBe(true);
    expect(canAccessRoute('admin', '/settings')).toBe(true);
    expect(canAccessRoute('super_admin', '/settings')).toBe(true);
    expect(canAccessRoute('super_admin', '/visitors')).toBe(true);
  });

  it('restricts office staff to permitted areas', () => {
    expect(canAccessRoute('office_staff', '/visitors')).toBe(true);
    expect(canAccessRoute('office_staff', '/leadership')).toBe(false);
    expect(canAccessRoute('office_staff', '/music')).toBe(false);
  });

  it('allows every role to access global church life routes', () => {
    expect(canAccessRoute('volunteer', '/church')).toBe(true);
    expect(canAccessRoute('choir_member', '/church/prayer')).toBe(true);
    expect(canAccessRoute('band_member', '/church/giving')).toBe(true);
  });

  it('unions route access across roles', () => {
    expect(
      canAccessRoute(
        { roles: ['deacon', 'choir_member', 'ministry_leader'], ministryIds: ['min-jamm'] },
        '/music/plans',
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        { roles: ['deacon', 'choir_member', 'ministry_leader'], ministryIds: ['min-jamm'] },
        '/ministries/jamm',
      ),
    ).toBe(true);
  });
});
