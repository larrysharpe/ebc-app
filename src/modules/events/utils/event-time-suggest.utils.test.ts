import { describe, expect, it } from 'vitest';

import {
  buildEventTimeSuggestPrompt,
  buildLocalEventTimeSuggestions,
  extractJsonObject,
  parseEventTimeSuggestResponse,
  scrapeEventTimeSuggestionsFromProse,
} from './event-time-suggest.utils';

describe('event-time-suggest utils', () => {
  it('parses fenced JSON suggestions inside the window', () => {
    const text = `\`\`\`json
{
  "summary": "Friday evenings look open.",
  "suggestions": [
    {
      "eventDate": "2026-09-11",
      "startTime": "18:00",
      "endTime": "20:00",
      "reason": "No calendar conflict; avoids Labor Day weekend."
    }
  ]
}
\`\`\``;

    const parsed = parseEventTimeSuggestResponse(text, '2026-09-01', '2026-11-30');
    expect(parsed.suggestions).toHaveLength(1);
    expect(parsed.suggestions[0]?.eventDate).toBe('2026-09-11');
  });

  it('extracts JSON buried in prose', () => {
    const text = [
      'Here is my recommendation after checking the calendar:',
      '',
      '{',
      '  "summary": "Tuesday works.",',
      '  "suggestions": [',
      '    {',
      '      "eventDate": "2026-09-15",',
      '      "startTime": "18:00",',
      '      "endTime": "20:00",',
      '      "reason": "Open evening"',
      '    }',
      '  ]',
      '}',
      '',
      'Let me know if you want more options.',
    ].join('\n');

    const parsed = extractJsonObject(text) as {
      suggestions: Array<{ eventDate: string }>;
    };
    expect(parsed.suggestions[0]?.eventDate).toBe('2026-09-15');
  });

  it('scrapes dates from prose when JSON is missing', () => {
    const scraped = scrapeEventTimeSuggestionsFromProse(
      'I recommend 2026-09-18 18:00-20:00 for lesson night, or 2026-09-25 18:00.',
      '2026-09-01',
      '2026-11-30',
    );
    expect(scraped?.suggestions.length).toBeGreaterThan(0);
    expect(scraped?.suggestions[0]?.eventDate).toBe('2026-09-18');
  });

  it('falls back to prose scrape inside parseEventTimeSuggestResponse', () => {
    const parsed = parseEventTimeSuggestResponse(
      'Best night is 2026-10-02 18:00–20:00 because the calendar is clear.',
      '2026-09-01',
      '2026-11-30',
    );
    expect(parsed.suggestions[0]?.eventDate).toBe('2026-10-02');
  });

  it('builds local suggestions that avoid busy and holiday dates', () => {
    const local = buildLocalEventTimeSuggestions({
      draft: { title: 'JAMM', preference: 'Friday evening' },
      calendarEvents: [
        {
          id: 'evt-1',
          title: 'Busy',
          eventDate: '2026-09-11',
          eventType: 'meeting',
          status: 'scheduled',
        },
      ],
      holidays: [{ date: '2026-09-04', name: 'Labor Day observed stand-in' }],
      fromIso: '2026-09-01',
      toIso: '2026-09-30',
    });

    expect(local.suggestions.length).toBeGreaterThan(0);
    expect(local.suggestions.every((s) => s.eventDate !== '2026-09-11')).toBe(true);
    expect(local.suggestions.every((s) => s.eventDate !== '2026-09-04')).toBe(true);
    expect(local.suggestions.every((s) => weekday(s.eventDate) === 5)).toBe(true);
  });

  it('includes calendar and holiday context in the prompt', () => {
    const prompt = buildEventTimeSuggestPrompt({
      draft: {
        title: 'JAMM Lesson Day',
        eventType: 'meeting',
        preference: 'Friday evening',
      },
      calendarEvents: [
        {
          id: 'evt-1',
          title: 'Board meeting',
          eventDate: '2026-09-10',
          startTime: '18:00',
          endTime: '19:30',
          eventType: 'meeting',
          status: 'scheduled',
        },
      ],
      holidays: [{ date: '2026-09-07', name: 'Labor Day' }],
      fromIso: '2026-09-01',
      toIso: '2026-11-30',
    });

    expect(prompt).toContain('JAMM Lesson Day');
    expect(prompt).toContain('Board meeting');
    expect(prompt).toContain('Labor Day');
    expect(prompt).toContain('Friday evening');
    expect(prompt).toContain('first non-whitespace character MUST be {');
  });
});

function weekday(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}
