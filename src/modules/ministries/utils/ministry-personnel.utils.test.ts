import { describe, expect, it } from 'vitest';

import {
  formatMinistryDuties,
  normalizeDutyCatalog,
  normalizeDuties,
  slugifyDutyId,
} from './ministry-personnel.utils';

describe('ministry duty helpers', () => {
  it('slugifies duty labels', () => {
    expect(slugifyDutyId('In-service Slides')).toBe('in_service_slides');
  });

  it('normalizes duty catalogs', () => {
    expect(
      normalizeDutyCatalog([
        {
          id: 'slides',
          label: 'Slides',
          email: 'slides@ebenezerbc.org',
          sopId: 'sop-1',
          active: true,
        },
        { id: '', label: 'Bad' },
        null,
      ]),
    ).toEqual([
      {
        id: 'slides',
        label: 'Slides',
        email: 'slides@ebenezerbc.org',
        sopId: 'sop-1',
        neededCount: 1,
        active: true,
      },
    ]);
  });

  it('reads neededCount from stored catalog rows', () => {
    expect(
      normalizeDutyCatalog([{ id: 'camera', label: 'Camera', neededCount: 3, active: true }]),
    ).toEqual([
      { id: 'camera', label: 'Camera', neededCount: 3, active: true },
    ]);
  });

  it('formats duty labels from catalog', () => {
    expect(
      formatMinistryDuties(['slides', 'camera'], [
        { id: 'slides', label: 'In-service slides', neededCount: 1, active: true },
        { id: 'camera', label: 'In-service camera', neededCount: 1, active: true },
      ]),
    ).toBe('In-service slides · In-service camera');
  });

  it('keeps assigned duty ids as strings', () => {
    expect(normalizeDuties(['slides', 'not-a-duty', 3])).toEqual(['slides', 'not-a-duty']);
  });
});
