import { describe, expect, it } from 'vitest';

import {
  inferServiceCharacteristicsFromTitle,
  isServiceCharacteristicMarkerTitle,
  mergeServiceCharacteristics,
} from './sunday-service-characteristic.utils';

describe('sunday-service-characteristic.utils', () => {
  it('detects WP ordinance-only titles', () => {
    expect(isServiceCharacteristicMarkerTitle('COMMUNION SUNDAY')).toBe(true);
    expect(isServiceCharacteristicMarkerTitle('Baptism Sunday')).toBe(true);
    expect(isServiceCharacteristicMarkerTitle('BABY DEDICATION SUNDAY')).toBe(
      true,
    );
    expect(isServiceCharacteristicMarkerTitle('Morning Worship')).toBe(false);
    expect(isServiceCharacteristicMarkerTitle('Communion Service')).toBe(false);
  });

  it('maps titles to characteristics', () => {
    expect(inferServiceCharacteristicsFromTitle('COMMUNION SUNDAY')).toEqual([
      'communion',
    ]);
    expect(inferServiceCharacteristicsFromTitle('BAPTISM SUNDAY')).toEqual([
      'baptism',
    ]);
    expect(inferServiceCharacteristicsFromTitle('BABY DEDICATION SUNDAY')).toEqual([
      'baby_dedication',
    ]);
  });

  it('merges characteristics uniquely', () => {
    expect(
      mergeServiceCharacteristics(['communion'], ['communion', 'baptism']),
    ).toEqual(['communion', 'baptism']);
  });
});
