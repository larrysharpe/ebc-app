import { describe, expect, it } from 'vitest';

import { mergeVoicePrompt, parseVoiceCommand } from './cursor-voice-input.utils';

describe('parseVoiceCommand', () => {
  it('extracts trailing submit commands', () => {
    expect(parseVoiceCommand('open media ministry sops submit')).toEqual({
      text: 'open media ministry sops',
      command: 'submit',
    });
  });

  it('recognizes standalone clear command', () => {
    expect(parseVoiceCommand('clear')).toEqual({ text: '', command: 'clear' });
  });

  it('prefers longer new-conversation phrase', () => {
    expect(parseVoiceCommand('start new conversation')).toEqual({
      text: 'start',
      command: 'new',
    });
  });

  it('returns plain text when no command is present', () => {
    expect(parseVoiceCommand('take me home')).toEqual({ text: 'take me home' });
  });
});

describe('mergeVoicePrompt', () => {
  it('joins base prompt with spoken text', () => {
    expect(mergeVoicePrompt('open', 'golden eagles')).toBe('open golden eagles');
  });

  it('returns spoken text when base is empty', () => {
    expect(mergeVoicePrompt('', 'go to music')).toBe('go to music');
  });
});
