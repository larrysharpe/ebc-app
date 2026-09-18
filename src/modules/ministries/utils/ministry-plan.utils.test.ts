import { describe, expect, it } from 'vitest';

import type { Ministry } from '../types';
import {
  buildMinistryPlanPrompt,
  buildMinistryPlanSignals,
} from './ministry-plan.utils';

const NOW = new Date('2026-07-10T12:00:00');

function baseMinistry(overrides: Partial<Ministry> = {}): Ministry {
  return {
    id: 'min-test',
    slug: 'test-ministry',
    name: 'Test Ministry',
    category: 'service',
    description: 'Test description',
    personnel: [],
    events: [],
    sops: [],
    dutyCatalog: [],
    ...overrides,
  };
}

describe('buildMinistryPlanSignals', () => {
  it('flags upcoming events in the next 28 days', () => {
    const signals = buildMinistryPlanSignals(
      baseMinistry({
        events: [
          {
            id: 'e1',
            title: 'Board meeting',
            startAt: '2026-07-17T19:00:00',
            location: 'FLC',
          },
          {
            id: 'e2',
            title: 'Far future',
            startAt: '2026-12-01T19:00:00',
          },
        ],
      }),
      NOW,
    );

    expect(signals.some((signal) => signal.label.includes('Board meeting'))).toBe(true);
    expect(signals.some((signal) => signal.label.includes('Far future'))).toBe(false);
  });

  it('flags open roles and unassigned duties', () => {
    const signals = buildMinistryPlanSignals(
      baseMinistry({
        dutyCatalog: [{ id: 'slides', label: 'Slides', neededCount: 1, active: true }],
        personnel: [
          {
            id: 'p-open',
            name: 'Photographer',
            role: 'volunteer',
            isOpenRole: true,
          },
        ],
      }),
      NOW,
    );

    expect(signals.some((signal) => signal.id.startsWith('open-'))).toBe(true);
    expect(signals.some((signal) => signal.id === 'duty-slides')).toBe(true);
  });

  it('flags a duty when assigned count is below how many are needed', () => {
    const signals = buildMinistryPlanSignals(
      baseMinistry({
        dutyCatalog: [{ id: 'camera', label: 'Camera', neededCount: 2, active: true }],
        personnel: [
          {
            id: 'p1',
            name: 'Alex Example',
            role: 'volunteer',
            duties: ['camera'],
          },
        ],
      }),
      NOW,
    );

    const camera = signals.find((signal) => signal.id === 'duty-camera');
    expect(camera?.detail).toBe('Need 2; 1 assigned');
  });

  it('flags empty calendar when meeting rhythm exists', () => {
    const signals = buildMinistryPlanSignals(
      baseMinistry({
        meetingSummary: '2nd Thursday, 7 PM',
        personnel: [{ id: 'p1', name: 'Lead', role: 'director' }],
      }),
      NOW,
    );

    expect(signals.some((signal) => signal.id === 'calendar-empty')).toBe(true);
  });
});

describe('buildMinistryPlanPrompt', () => {
  it('omits emails and phones from the prompt', () => {
    const prompt = buildMinistryPlanPrompt({
      now: NOW,
      signals: [],
      ministry: baseMinistry({
        contactEmail: 'secret@ebenezerbc.org',
        personnel: [
          {
            id: 'p1',
            name: 'Alex Example',
            role: 'member',
            email: 'alex@example.com',
            phone: '555-0100',
            duties: ['slides'],
          },
        ],
        dutyCatalog: [{ id: 'slides', label: 'Slides', neededCount: 1, active: true }],
      }),
    });

    expect(prompt).toContain('Alex Example');
    expect(prompt).toContain('Slides');
    expect(prompt).not.toContain('secret@ebenezerbc.org');
    expect(prompt).not.toContain('alex@example.com');
    expect(prompt).not.toContain('555-0100');
    expect(prompt).toContain('Week 1');
  });
});
