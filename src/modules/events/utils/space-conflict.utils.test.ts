import { describe, expect, it } from 'vitest';

import {
  findSpaceConflicts,
  formatSpaceConflictMessage,
} from '@/modules/events/utils/space-conflict.utils';

describe('space-conflict.utils', () => {
  const candidates = [
    {
      id: 'evt-1',
      title: 'Youth night',
      eventDate: '2026-08-01',
      startTime: '18:00',
      endTime: '20:00',
      status: 'scheduled' as const,
      spaceId: 'space-1f-gym',
      location: 'Gym (1st Floor)',
    },
    {
      id: 'evt-2',
      title: 'Choir practice',
      eventDate: '2026-08-01',
      startTime: '19:00',
      endTime: '21:00',
      status: 'draft' as const,
      spaceId: 'space-1f-gym',
      location: 'Gym (1st Floor)',
    },
    {
      id: 'evt-3',
      title: 'Cancelled',
      eventDate: '2026-08-01',
      startTime: '18:00',
      endTime: '20:00',
      status: 'cancelled' as const,
      spaceId: 'space-1f-gym',
      location: 'Gym (1st Floor)',
    },
  ];

  it('finds overlapping room bookings and skips cancelled', () => {
    const hits = findSpaceConflicts({
      spaceId: 'space-1f-gym',
      eventDate: '2026-08-01',
      startTime: '19:30',
      endTime: '20:30',
      candidates,
    });
    expect(hits.map((hit) => hit.id)).toEqual(['evt-1', 'evt-2']);
  });

  it('excludes the event being edited', () => {
    const hits = findSpaceConflicts({
      spaceId: 'space-1f-gym',
      eventDate: '2026-08-01',
      startTime: '18:00',
      endTime: '20:00',
      excludeEventId: 'evt-1',
      candidates,
    });
    expect(hits.map((hit) => hit.id)).toEqual(['evt-2']);
  });

  it('formats a clear conflict message', () => {
    const message = formatSpaceConflictMessage(
      [
        {
          id: 'evt-1',
          title: 'Youth night',
          startTime: '18:00',
          endTime: '20:00',
          status: 'scheduled',
        },
      ],
      'Gym (1st Floor)',
    );
    expect(message).toContain('Gym (1st Floor)');
    expect(message).toContain('Youth night');
    expect(message).toContain('18:00–20:00');
  });
});
