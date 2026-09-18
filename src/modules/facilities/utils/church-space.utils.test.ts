import { describe, expect, it } from 'vitest';

import { CHURCH_SPACES_SEED } from '@/modules/facilities/constants/church-space.constants';
import {
  findSpaceOptionByLocation,
  formatChurchSpaceLabel,
  groupSpacesByFloor,
  toChurchSpaceOption,
} from '@/modules/facilities/utils/church-space.utils';

describe('church-space.utils', () => {
  it('formats space labels with floor', () => {
    expect(formatChurchSpaceLabel({ floor: 'first', name: 'Gym' })).toBe(
      'Gym (1st Floor)',
    );
    expect(
      formatChurchSpaceLabel({ floor: 'second', name: 'Chapel' }),
    ).toBe('Chapel (2nd Floor)');
  });

  it('groups seed spaces by floor', () => {
    const groups = groupSpacesByFloor([...CHURCH_SPACES_SEED]);
    expect(groups.first.map((s) => s.name)).toContain('Gym');
    expect(groups.second.map((s) => s.name)).toContain('Chapel');
    expect(groups.third.map((s) => s.name)).toContain('Pastors Room');
    expect(groups.first[0]?.name).toBe('Gym');
  });

  it('matches location strings to options', () => {
    const options = CHURCH_SPACES_SEED.map((seed) =>
      toChurchSpaceOption({ ...seed, active: true }),
    );
    expect(findSpaceOptionByLocation('Gym (1st Floor)', options)?.id).toBe(
      'space-1f-gym',
    );
    expect(findSpaceOptionByLocation('Chapel', options)?.id).toBe(
      'space-2f-chapel',
    );
    expect(findSpaceOptionByLocation('Offsite hall', options)).toBeUndefined();
  });
});
