import { describe, expect, it } from 'vitest';

import { buildAttentionItems } from './home-attention.utils';

describe('buildAttentionItems', () => {
  const now = new Date('2026-07-26T12:00:00');

  it('orders by urgency with sooner services first', () => {
    const items = buildAttentionItems({
      now,
      includeDraftPlans: true,
      includeVisitors: true,
      draftPlans: [
        {
          id: 'p2',
          title: 'Later',
          serviceDate: '2026-08-10',
          songCount: 4,
        },
        {
          id: 'p1',
          title: 'Soon',
          serviceDate: '2026-07-27',
          songCount: 3,
        },
      ],
      newVisitors: [
        { id: 'v1', name: 'Pat Guest', visitDate: '2026-07-20' },
      ],
      sopGaps: [],
      ministriesWithoutPersonnel: [],
    });

    expect(items[0]?.id).toBe('plan-p1');
    expect(items.map((item) => item.id)).toContain('visitor-v1');
    expect(items.find((item) => item.id === 'plan-p2')?.tone).toBe('normal');
  });

  it('omits drafts and visitors when not in scope', () => {
    const items = buildAttentionItems({
      now,
      includeDraftPlans: false,
      includeVisitors: false,
      draftPlans: [
        { id: 'p1', title: 'Soon', serviceDate: '2026-07-27', songCount: 3 },
      ],
      newVisitors: [{ id: 'v1', name: 'Pat Guest', visitDate: '2026-07-20' }],
      sopGaps: [
        {
          ministrySlug: 'youth',
          ministryName: 'Youth',
          sopTitle: 'Safety',
          score: 40,
          minScore: 70,
        },
      ],
      ministriesWithoutPersonnel: [{ slug: 'youth', name: 'Youth' }],
    });

    expect(items.every((item) => !item.id.startsWith('plan-'))).toBe(true);
    expect(items.every((item) => !item.id.startsWith('visitor-'))).toBe(true);
    expect(items.map((item) => item.id)).toEqual([
      'sop-youth-Safety',
      'personnel-youth',
    ]);
  });
});
