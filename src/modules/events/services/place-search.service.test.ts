import { describe, expect, it } from 'vitest';

import { mapPhotonFeature } from '@/modules/events/services/place-search.service';

describe('place-search.service', () => {
  it('maps a business feature to a readable label', () => {
    const result = mapPhotonFeature(
      {
        properties: {
          osm_id: 123,
          osm_type: 'N',
          name: 'Popeyes Louisiana Kitchen',
          street: 'Jefferson Davis Hwy',
          housenumber: '14000',
          city: 'Woodbridge',
          state: 'Virginia',
        },
        geometry: { coordinates: [-77.29, 38.66] },
      },
      0,
    );

    expect(result).toEqual({
      id: 'N-123',
      name: 'Popeyes Louisiana Kitchen',
      label: 'Popeyes Louisiana Kitchen · 14000 Jefferson Davis Hwy, Woodbridge, Virginia',
      secondary: '14000 Jefferson Davis Hwy, Woodbridge, Virginia',
      lat: 38.66,
      lon: -77.29,
    });
  });

  it('skips features without a usable name', () => {
    expect(mapPhotonFeature({ properties: {} }, 0)).toBeNull();
  });
});
