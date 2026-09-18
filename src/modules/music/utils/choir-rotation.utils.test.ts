import { describe, expect, it } from 'vitest';

import {
  buildScheduleRows,
  parseChoirRotationConfig,
} from './choir-rotation.utils';

describe('parseChoirRotationConfig', () => {
  it('falls back to seed person leaders when JSON is empty', () => {
    const config = parseChoirRotationConfig(null, null);
    expect(config.defaultBySunday[1]).toBe('senior');
    expect(config.leadersByGroup.senior[0]?.personId).toBe('person-lydia-stewart');
  });

  it('merges custom Sunday assignments and person leaders', () => {
    const config = parseChoirRotationConfig(
      { '1': 'mens', '4': 'senior' },
      {
        mens: [{ personId: 'person-leonard-whicker', title: 'Deacon' }],
      },
    );
    expect(config.defaultBySunday[1]).toBe('mens');
    expect(config.defaultBySunday[4]).toBe('senior');
    expect(config.defaultBySunday[2]).toBe('youth');
    expect(config.leadersByGroup.mens[0]?.personId).toBe('person-leonard-whicker');
  });
});

describe('buildScheduleRows', () => {
  it('builds five Sunday rows from config', () => {
    const config = parseChoirRotationConfig(null, null);
    const rows = buildScheduleRows(config);
    expect(rows).toHaveLength(5);
    expect(rows[0]?.sunday).toBe(1);
    expect(rows[0]?.choirGroup).toBe(config.defaultBySunday[1]);
  });
});
