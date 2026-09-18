import { describe, expect, it } from 'vitest';

import { buildActivityRequestDefaults } from './activity-request-defaults.utils';
import {
  buildLocalActivityRequestReview,
  parseActivityRequestReviewResponse,
} from './activity-request-review.utils';

describe('activity-request-review', () => {
  it('flags missing media and kitchen decisions', () => {
    const activityRequest = buildActivityRequestDefaults('meeting');
    const review = buildLocalActivityRequestReview({
      title: 'Board meeting',
      eventType: 'meeting',
      eventDate: '2026-10-15',
      locationMode: 'church',
      spaceId: 'space-1',
      location: 'Room 117',
      status: 'draft',
      activityRequest: {
        ...activityRequest,
        acknowledgements: {
          cleanRoom: true,
          noBannersWithoutPermission: true,
          conflictMayReschedule: true,
        },
      },
    });

    expect(review.status).toBe('blocked');
    expect(review.findings.some((item) => item.area === 'media')).toBe(true);
    expect(review.findings.some((item) => item.area === 'kitchen')).toBe(true);
    expect(review.findings.some((item) => item.area === 'floorPlan')).toBe(
      true,
    );
  });

  it('passes when checklists and acknowledgements are complete', () => {
    const activityRequest = buildActivityRequestDefaults('meeting');
    activityRequest.media.noneConfirmed = true;
    activityRequest.kitchen.noneConfirmed = true;
    activityRequest.floorPlan.noneConfirmed = true;
    activityRequest.acknowledgements = {
      cleanRoom: true,
      noBannersWithoutPermission: true,
      conflictMayReschedule: true,
    };

    const review = buildLocalActivityRequestReview({
      title: 'Board meeting',
      eventType: 'meeting',
      eventDate: '2026-10-15',
      startTime: '19:00',
      endTime: '20:30',
      locationMode: 'church',
      spaceId: 'space-1',
      location: 'Room 117',
      status: 'draft',
      activityRequest,
    });

    expect(review.status).toBe('ok');
    expect(review.findings.filter((item) => item.severity === 'blocker')).toEqual(
      [],
    );
  });

  it('merges AI findings with local blockers', () => {
    const local = buildLocalActivityRequestReview({
      title: '',
      eventType: 'meeting',
      locationMode: 'unset',
      status: 'draft',
      activityRequest: buildActivityRequestDefaults('meeting'),
    });
    const merged = parseActivityRequestReviewResponse(
      JSON.stringify({
        summary: 'Needs a few fixes.',
        status: 'needs_attention',
        findings: [
          {
            severity: 'tip',
            area: 'other',
            message: 'Consider inviting ushers if guests will attend.',
          },
        ],
      }),
      local,
    );

    expect(merged.findings.some((item) => item.area === 'form')).toBe(true);
    expect(
      merged.findings.some((item) =>
        item.message.includes('ushers'),
      ),
    ).toBe(true);
    expect(merged.status).toBe('blocked');
  });
});
