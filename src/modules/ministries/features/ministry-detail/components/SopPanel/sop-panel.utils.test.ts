import { describe, expect, it } from 'vitest';

import type { MinistrySop } from '@/modules/ministries/types';

import { resolveSelectedSop, sopStatusClass, sopStatusLabel } from './sop-panel.utils';

function sop(id: string, title: string): MinistrySop {
  return {
    id,
    title,
    content: '## Purpose\n\nDo the work.',
    updatedAt: '2026-09-02T12:00:00.000Z',
    status: 'approved',
  };
}

describe('resolveSelectedSop', () => {
  const sops = [sop('sop-1', 'Check-in'), sop('sop-2', 'Cleanup')];

  it('returns null when there are no SOPs', () => {
    expect(resolveSelectedSop([], 'sop-1')).toBeNull();
  });

  it('returns the matching SOP when the id is in the list', () => {
    expect(resolveSelectedSop(sops, 'sop-2')?.title).toBe('Cleanup');
  });

  it('falls back to the first SOP when the id is missing', () => {
    expect(resolveSelectedSop(sops, 'gone')?.id).toBe('sop-1');
    expect(resolveSelectedSop(sops, null)?.id).toBe('sop-1');
  });
});

describe('sop status helpers', () => {
  it('labels unknown status as draft', () => {
    expect(sopStatusLabel(undefined)).toBe('Draft');
    expect(sopStatusClass(undefined)).toContain('ebc-gold');
  });

  it('labels approved status', () => {
    expect(sopStatusLabel('approved')).toBe('Approved');
    expect(sopStatusClass('approved')).toContain('ebc-green');
  });
});
