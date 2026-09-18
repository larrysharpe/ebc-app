import { describe, expect, it } from 'vitest';

import {
  buildSeedOccurrences,
  buildSeedServiceCharacteristicTags,
  formatRecurringLabel,
  inferEventType,
  matchMinistryId,
  parseIcalEvent,
} from './ebenezerbc-calendar.utils';

const SAMPLE_ICAL = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20260722T090000Z
DTEND:20260722T100000Z
SUMMARY:Prayer Call &amp; Fasting
DESCRIPTION:Join us
URL:https://ebenezerbc.org/events/prayer
RRULE:FREQ=WEEKLY
END:VEVENT
END:VCALENDAR`;

describe('ebenezerbc-calendar.utils', () => {
  it('parses iCal and decodes entities', () => {
    const parsed = parseIcalEvent(SAMPLE_ICAL);
    expect(parsed?.summary).toBe('Prayer Call & Fasting');
    expect(parsed?.rrule).toBe('FREQ=WEEKLY');
  });

  it('maps titles to ministries', () => {
    expect(matchMinistryId('Youth Praise Dance Ministry')).toBe('min-youth');
    expect(matchMinistryId('Sunday School')).toBe('min-sunday-school');
    expect(matchMinistryId('Morning Worship')).toBeUndefined();
  });

  it('infers event types', () => {
    expect(inferEventType('Morning Worship')).toBe('worship');
    expect(inferEventType('Sunday School')).toBe('education');
    expect(inferEventType('Wednesday Prayer & Bible Study')).toBe('education');
    expect(inferEventType('Midweek Prayer')).toBe('meeting');
    expect(inferEventType('Tithing Foundation Food Pantry')).toBe('outreach');
  });

  it('labels RRULEs', () => {
    expect(formatRecurringLabel('FREQ=WEEKLY')).toBe('Weekly');
    expect(formatRecurringLabel('FREQ=MONTHLY;BYDAY=1SA')).toBe(
      '1st Saturday monthly',
    );
  });

  it('expands weekly occurrences into the seed window', () => {
    const parsed = parseIcalEvent(SAMPLE_ICAL);
    expect(parsed).not.toBeNull();
    const rows = buildSeedOccurrences(5359, parsed!, 'https://example.com', {
      from: new Date('2026-07-18T00:00:00'),
      horizonDays: 21,
    });
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows[0]?.id.startsWith('wp-5359-')).toBe(true);
    expect(rows.every((row) => row.title === 'Prayer Call & Fasting')).toBe(true);
  });

  it('treats communion/baptism/dedication Sundays as service tags, not events', () => {
    const communionIcal = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20260802T140000Z
SUMMARY:COMMUNION SUNDAY
RRULE:FREQ=MONTHLY;BYDAY=1SU
END:VEVENT
END:VCALENDAR`;
    const parsed = parseIcalEvent(communionIcal);
    expect(parsed).not.toBeNull();
    expect(
      buildSeedOccurrences(5331, parsed!, 'https://example.com', {
        from: new Date('2026-07-26T00:00:00'),
        horizonDays: 60,
      }),
    ).toEqual([]);
    const tags = buildSeedServiceCharacteristicTags(
      5331,
      parsed!,
      'https://example.com',
      {
        from: new Date('2026-07-26T00:00:00'),
        horizonDays: 60,
      },
    );
    expect(tags.length).toBeGreaterThan(0);
    expect(tags.every((tag) => tag.characteristics.includes('communion'))).toBe(
      true,
    );
  });
});
