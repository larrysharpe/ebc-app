import { describe, expect, it } from 'vitest';

import {
  addMinistryDutySchema,
  updateMinistryDutySchema,
} from './ministry-duty.schemas';

describe('ministry duty schemas', () => {
  it('accepts a new duty label', () => {
    const parsed = addMinistryDutySchema.safeParse({
      label: 'In-service slides',
      description: 'Advance worship slides',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid custom ids', () => {
    const parsed = addMinistryDutySchema.safeParse({
      label: 'Slides',
      id: 'Bad Id!',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts duty email and sop id', () => {
    const parsed = addMinistryDutySchema.safeParse({
      label: 'Sound',
      email: 'sound@ebenezerbc.org',
      sopId: 'sop-web-med-1',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe('sound@ebenezerbc.org');
      expect(parsed.data.sopId).toBe('sop-web-med-1');
    }
  });

  it('rejects invalid duty email', () => {
    const parsed = addMinistryDutySchema.safeParse({
      label: 'Sound',
      email: 'not-an-email',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts how many people are needed', () => {
    const parsed = addMinistryDutySchema.safeParse({
      label: 'Camera',
      neededCount: 3,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.neededCount).toBe(3);
    }
  });

  it('defaults needed count to 1', () => {
    const parsed = addMinistryDutySchema.safeParse({
      label: 'Sound',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.neededCount).toBe(1);
    }
  });

  it('rejects needed count below 1', () => {
    const parsed = updateMinistryDutySchema.safeParse({
      id: 'camera',
      label: 'Camera',
      neededCount: 0,
      active: true,
    });
    expect(parsed.success).toBe(false);
  });
});
