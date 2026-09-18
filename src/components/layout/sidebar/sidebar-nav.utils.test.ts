import { describe, expect, it } from 'vitest';

import { getNavItemsForRoles } from './sidebar-nav.utils';

describe('getNavItemsForRoles', () => {
  it('gives choir members job-first music links with plain labels', () => {
    const music = getNavItemsForRoles(['choir_member']).find((item) => item.href === '/music');
    const labels = music?.children?.map((child) => child.label) ?? [];
    expect(labels).toContain('Songs');
    expect(labels).toContain('My choirs');
    expect(labels).not.toContain('Choir setup');
    expect(labels).not.toContain('Musician intake');
    expect(labels).not.toContain('Director settings');
  });

  it('gives music ministers setup tools after job links', () => {
    const music = getNavItemsForRoles(['music_minister']).find((item) => item.href === '/music');
    const labels = music?.children?.map((child) => child.label) ?? [];
    expect(labels[0]).toBe('Choir plans');
    expect(labels).toContain('Songs');
    expect(labels).toContain('Choir setup');
    expect(labels).toContain('New musicians');
    expect(labels.indexOf('Choir plans')).toBeLessThan(labels.indexOf('Music people'));
  });

  it('renames Sunday services for clarity', () => {
    const events = getNavItemsForRoles(['office_staff']).find((item) => item.href === '/events');
    expect(events?.children?.map((child) => child.label)).toEqual([
      'Calendar',
      'Sunday services',
    ]);
  });
});
