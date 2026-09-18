import { describe, expect, it } from 'vitest';

import {
  canApproveActivityRequest,
  canManageChurchCalendar,
  canManageListedEvent,
  canManageMinistryEvents,
} from './church-event-access.utils';

describe('church-event-access', () => {
  it('allows office staff to manage the church calendar', () => {
    expect(canManageChurchCalendar('office_staff')).toBe(true);
    expect(canManageChurchCalendar('ministry_leader')).toBe(false);
  });

  it('allows ministry leaders only for their ministry', () => {
    const leader = {
      roles: ['ministry_leader'] as const,
      ministryIds: ['min-youth'],
    };
    expect(canManageMinistryEvents(leader, 'min-youth')).toBe(true);
    expect(canManageMinistryEvents(leader, 'min-media')).toBe(false);
  });

  it('on ministry calendar, only allows actions for that ministry’s events', () => {
    expect(
      canManageListedEvent(
        { ministryId: 'min-youth', status: 'scheduled' },
        { canManage: true, manageMinistryId: 'min-youth' },
      ),
    ).toBe(true);
    expect(
      canManageListedEvent(
        { ministryId: undefined, status: 'scheduled' },
        { canManage: true, manageMinistryId: 'min-youth' },
      ),
    ).toBe(false);
    expect(
      canManageListedEvent(
        { ministryId: 'min-media', status: 'scheduled' },
        { canManage: true, manageMinistryId: 'min-youth' },
      ),
    ).toBe(false);
  });

  it('on staff Events page, allows actions for any non-cancelled event', () => {
    expect(
      canManageListedEvent(
        { ministryId: undefined, status: 'scheduled' },
        { canManage: true },
      ),
    ).toBe(true);
    expect(
      canManageListedEvent(
        { ministryId: 'min-youth', status: 'cancelled' },
        { canManage: true },
      ),
    ).toBe(false);
  });

  it('allows office staff and trustees to approve activity requests', () => {
    expect(canApproveActivityRequest('office_staff')).toBe(true);
    expect(canApproveActivityRequest('trustee')).toBe(true);
    expect(canApproveActivityRequest('ministry_leader')).toBe(false);
  });
});
