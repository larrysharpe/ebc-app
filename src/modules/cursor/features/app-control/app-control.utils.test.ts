import { describe, expect, it } from 'vitest';

import {
  extractAppActionsFromText,
  isAllowedAppPath,
  parseAppControlIntent,
  stripAppActionBlock,
} from './app-control.utils';

describe('parseAppControlIntent', () => {
  it('opens media ministry SOPs', () => {
    const result = parseAppControlIntent('open the media ministry sop');
    expect(result?.action).toEqual({
      type: 'navigate',
      path: '/ministries/media-ministry?tab=sops',
      label: 'Media Ministry · SOPs',
    });
  });

  it('opens golden eagles overview by name', () => {
    const result = parseAppControlIntent('go to Golden Eagles');
    expect(result?.action.path).toBe('/ministries/golden-eagles');
  });

  it('opens music plans', () => {
    const result = parseAppControlIntent('show music plans');
    expect(result?.action.path).toBe('/music/plans');
  });

  it('ignores non-navigation prompts', () => {
    expect(parseAppControlIntent('how do SOPs work?')).toBeNull();
  });
});

describe('extractAppActionsFromText', () => {
  it('parses APP_ACTION JSON from agent replies', () => {
    const text = [
      'Opening Media Ministry SOPs now.',
      '',
      'APP_ACTION',
      '{"type":"navigate","path":"/ministries/media-ministry?tab=sops","label":"Media Ministry · SOPs"}',
    ].join('\n');

    expect(extractAppActionsFromText(text)).toEqual([
      {
        type: 'navigate',
        path: '/ministries/media-ministry?tab=sops',
        label: 'Media Ministry · SOPs',
      },
    ]);
  });

  it('rejects disallowed paths', () => {
    const text =
      'APP_ACTION\n{"type":"navigate","path":"https://evil.example","label":"Nope"}';
    expect(extractAppActionsFromText(text)).toEqual([]);
  });
});

describe('stripAppActionBlock', () => {
  it('removes the machine block from display text', () => {
    const text = 'Opening now.\n\nAPP_ACTION\n{"type":"navigate","path":"/music","label":"Music"}\n';
    expect(stripAppActionBlock(text)).toBe('Opening now.');
  });
});

describe('isAllowedAppPath', () => {
  it('allows ministry and music paths', () => {
    expect(isAllowedAppPath('/ministries/media-ministry?tab=sops')).toBe(true);
    expect(isAllowedAppPath('/music/plans')).toBe(true);
  });

  it('blocks external and traversal paths', () => {
    expect(isAllowedAppPath('https://example.com')).toBe(false);
    expect(isAllowedAppPath('/ministries/../settings')).toBe(false);
  });
});
