import { describe, expect, it } from 'vitest';

import {
  buildActivityRequestDefaults,
  needsSaturdayTrusteeNote,
} from './activity-request-defaults.utils';
import {
  daysUntilEventDate,
  getLeadTimeBanner,
  getLeadTimeTier,
  requiresEmergencyApproval,
} from './event-lead-time.utils';

describe('activity-request defaults', () => {
  it('pre-checks media for worship and special', () => {
    expect(buildActivityRequestDefaults('worship').media.needed).toBe(true);
    expect(buildActivityRequestDefaults('special').media.sound).toBe(true);
  });

  it('leaves media off for education and meeting', () => {
    expect(buildActivityRequestDefaults('education').media.needed).toBe(false);
    expect(buildActivityRequestDefaults('meeting').media.needed).toBe(false);
  });

  it('asks explicitly for outreach and other', () => {
    expect(buildActivityRequestDefaults('outreach').media.needed).toBe(false);
    expect(buildActivityRequestDefaults('other').media.needed).toBe(false);
    expect(
      buildActivityRequestDefaults('outreach').coordination.otherChurches,
    ).toBe(true);
  });

  it('flags Saturday after noon for trustee note', () => {
    expect(needsSaturdayTrusteeNote('2026-08-01', '13:00')).toBe(true);
    expect(needsSaturdayTrusteeNote('2026-08-01', '09:00')).toBe(false);
    expect(needsSaturdayTrusteeNote('2026-08-02', '13:00')).toBe(false);
  });
});

describe('event lead time', () => {
  const now = new Date('2026-07-30T15:00:00');

  it('counts whole days until the event', () => {
    expect(daysUntilEventDate('2026-07-30', now)).toBe(0);
    expect(daysUntilEventDate('2026-08-02', now)).toBe(3);
    expect(daysUntilEventDate('2026-10-28', now)).toBe(90);
  });

  it('maps day counts to tiers', () => {
    expect(getLeadTimeTier(90)).toBe('plenty');
    expect(getLeadTimeTier(89)).toBe('ok');
    expect(getLeadTimeTier(28)).toBe('ok');
    expect(getLeadTimeTier(27)).toBe('short');
    expect(getLeadTimeTier(3)).toBe('short');
    expect(getLeadTimeTier(2)).toBe('emergency');
  });

  it('builds a banner for a dated event', () => {
    const banner = getLeadTimeBanner('2026-08-20', now);
    expect(banner?.tier).toBe('short');
    expect(banner?.tone).toBe('amber');
    expect(banner?.message).toContain('Under 4 weeks');
  });

  it('requires emergency approval under 3 days', () => {
    expect(requiresEmergencyApproval('2026-08-01', now)).toBe(true);
    expect(requiresEmergencyApproval('2026-08-02', now)).toBe(false);
    expect(requiresEmergencyApproval(undefined, now)).toBe(false);
  });
});
