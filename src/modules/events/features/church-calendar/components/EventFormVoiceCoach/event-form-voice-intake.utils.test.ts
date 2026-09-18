import { describe, expect, it } from 'vitest';

import {
  createIntakeSession,
  getIntakeOpeningPrompt,
  processIntakeTurn,
} from './event-form-voice-intake.utils';

describe('processIntakeTurn', () => {
  it('opens by collecting a story then asks for what is missing', () => {
    const opening = createIntakeSession();
    expect(getIntakeOpeningPrompt()).toContain('I am listening');

    const turn = processIntakeTurn(
      opening,
      'The title is Fall Fresh Kickoff, it is a special service on 2026-09-18 at the church, contact is Cherita, about 40 people, no media needed, no kitchen needed, no floor plan needed',
    );

    expect(turn.patch.title).toBe('Fall Fresh Kickoff');
    expect(turn.patch.eventType).toBe('special');
    expect(turn.patch.eventDate).toBe('2026-09-18');
    expect(turn.patch.locationMode).toBe('church');
    expect(turn.patch.contactName).toBe('Cherita');
    expect(turn.patch.mediaNone).toBe(true);
    expect(turn.session.phase).toBe('clarifying');
    expect(turn.session.pendingSlot).toBe('startTime');
    expect(turn.reply).toContain('What time does it start');
  });

  it('answers a clarifying question in context', () => {
    const session = {
      ...createIntakeSession(),
      phase: 'clarifying' as const,
      openingCollected: true,
      pendingSlot: 'startTime' as const,
      known: {
        title: 'Fall Fresh',
        eventType: 'special' as const,
        eventDate: '2026-09-18',
        locationMode: 'church' as const,
        contactName: 'Cherita',
        participantsEstimate: 40,
        mediaResolved: true,
        kitchenResolved: true,
        floorPlanResolved: true,
      },
    };

    const turn = processIntakeTurn(session, '7 pm');
    expect(turn.patch.startTime).toBe('19:00');
    expect(turn.session.phase).toBe('ready');
  });
});
