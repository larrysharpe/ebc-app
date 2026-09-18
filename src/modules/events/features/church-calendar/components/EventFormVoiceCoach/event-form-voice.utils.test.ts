import { describe, expect, it } from 'vitest';

import {
  buildStepGuidance,
  parseEventFormVoiceCommand,
  pickNaturalSpeechVoice,
  scoreSpeechVoice,
  softenConversationalText,
} from './event-form-voice.utils';

describe('softenConversationalText', () => {
  it('strips polite filler', () => {
    expect(softenConversationalText('Can you suggest the time for me')).toBe(
      'suggest the time',
    );
  });
});

describe('pickNaturalSpeechVoice', () => {
  it('prefers neural English voices over compact defaults', () => {
    const picked = pickNaturalSpeechVoice([
      {
        name: 'Fred',
        lang: 'en-US',
        localService: true,
      },
      {
        name: 'Google US English',
        lang: 'en-US',
        localService: false,
      },
      {
        name: 'Microsoft Aria Online (Natural) - English (United States)',
        lang: 'en-US',
        localService: false,
      },
      {
        name: 'Samantha Compact',
        lang: 'en-US',
        localService: true,
      },
    ]);
    expect(picked?.name).toContain('Aria');
  });

  it('scores non-English voices as unusable', () => {
    expect(
      scoreSpeechVoice({ name: 'Google Deutsch', lang: 'de-DE', localService: false }),
    ).toBeLessThan(0);
  });
});

describe('parseEventFormVoiceCommand', () => {
  it('parses navigation and checklist commands', () => {
    expect(parseEventFormVoiceCommand('continue').type).toBe('next');
    expect(parseEventFormVoiceCommand('go back').type).toBe('back');
    expect(parseEventFormVoiceCommand('no media needed')).toEqual({
      type: 'mediaNone',
    });
    expect(parseEventFormVoiceCommand('need sound')).toEqual({
      type: 'mediaNeed',
      field: 'sound',
    });
    expect(parseEventFormVoiceCommand('8 round tables')).toEqual({
      type: 'floorPlanQty',
      field: 'roundTables',
      qty: 8,
    });
  });

  it('parses conversational time suggestions', () => {
    expect(
      parseEventFormVoiceCommand('Can you suggest the time for me'),
    ).toEqual({ type: 'suggestTime' });
    expect(
      parseEventFormVoiceCommand('suggest a time for Friday evening'),
    ).toEqual({
      type: 'suggestTime',
      preference: 'friday evening',
    });
    expect(parseEventFormVoiceCommand('looking for Saturday morning')).toEqual({
      type: 'setTimePreference',
      preference: 'saturday morning',
    });
    expect(parseEventFormVoiceCommand('use the first one')).toEqual({
      type: 'useSuggestion',
      index: 0,
    });
  });

  it('parses natural next / media phrasing', () => {
    expect(parseEventFormVoiceCommand("I'm done").type).toBe('next');
    expect(parseEventFormVoiceCommand('we do not need media')).toEqual({
      type: 'mediaNone',
    });
  });

  it('parses title, type, date, and time', () => {
    expect(parseEventFormVoiceCommand('title is Fall Fresh')).toEqual({
      type: 'setTitle',
      title: 'fall fresh',
    });
    expect(parseEventFormVoiceCommand('type is bible study')).toEqual({
      type: 'setEventType',
      eventType: 'education',
    });
    expect(parseEventFormVoiceCommand('date is 2026-09-18')).toEqual({
      type: 'setEventDate',
      eventDate: '2026-09-18',
    });
    expect(parseEventFormVoiceCommand('starts at 7 pm')).toEqual({
      type: 'setStartTime',
      startTime: '19:00',
    });
  });

  it('parses review actions', () => {
    expect(parseEventFormVoiceCommand('check for problems').type).toBe(
      'runReview',
    );
    expect(parseEventFormVoiceCommand('save draft').type).toBe('saveDraft');
    expect(parseEventFormVoiceCommand('submit for approval').type).toBe(
      'submitApproval',
    );
  });
});

describe('buildStepGuidance', () => {
  it('returns conversational guidance for when and review', () => {
    expect(buildStepGuidance('when')).toContain('suggest a time');
    expect(buildStepGuidance('review')).toContain('check for problems');
  });
});
