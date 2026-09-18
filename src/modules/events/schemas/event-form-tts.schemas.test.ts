import { describe, expect, it } from 'vitest';

import { eventFormTtsRequestSchema } from './event-form-tts.schemas';

describe('eventFormTtsRequestSchema', () => {
  it('accepts spoken coach lines', () => {
    const parsed = eventFormTtsRequestSchema.safeParse({
      text: 'Great — I am listening.',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects empty text', () => {
    expect(eventFormTtsRequestSchema.safeParse({ text: '   ' }).success).toBe(
      false,
    );
  });
});
