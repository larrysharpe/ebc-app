import { describe, expect, it } from 'vitest';

import type { CursorHistoryEntry } from './cursor-history.types';
import { appendCursorHistory, previewResponse } from './cursor-history.utils';

describe('cursor history helpers', () => {
  it('previews long responses', () => {
    const long = 'a'.repeat(200);
    expect(previewResponse(long)?.endsWith('…')).toBe(true);
  });

  it('prepends new entries and dedupes same prompt+kind', () => {
    const first: CursorHistoryEntry = {
      id: '1',
      prompt: 'open media ministry sop',
      kind: 'navigate',
      createdAt: '2026-07-10T12:00:00.000Z',
      status: 'ok',
      canWrite: false,
    };
    const second: CursorHistoryEntry = {
      ...first,
      id: '2',
      createdAt: '2026-07-10T12:01:00.000Z',
    };

    const result = appendCursorHistory([first], second);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('2');
  });
});
