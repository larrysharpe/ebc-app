import { describe, expect, it } from 'vitest';

import {
  looksLikeHtml,
  normalizeRichTextValue,
  plainTextToEditorHtml,
  richTextToPlainText,
} from './rich-text.utils';

describe('looksLikeHtml', () => {
  it('detects tags', () => {
    expect(looksLikeHtml('<p>Hello</p>')).toBe(true);
    expect(looksLikeHtml('Hello')).toBe(false);
  });
});

describe('normalizeRichTextValue', () => {
  it('returns undefined for empty TipTap shells', () => {
    expect(normalizeRichTextValue('')).toBeUndefined();
    expect(normalizeRichTextValue('<p></p>')).toBeUndefined();
    expect(normalizeRichTextValue('<p><br></p>')).toBeUndefined();
    expect(normalizeRichTextValue('<p><br/></p>')).toBeUndefined();
  });

  it('keeps meaningful HTML', () => {
    expect(normalizeRichTextValue('<p>Thank you!</p>')).toBe('<p>Thank you!</p>');
  });

  it('keeps plain text', () => {
    expect(normalizeRichTextValue('Be blessed,\nNiki')).toBe('Be blessed,\nNiki');
  });
});

describe('plainTextToEditorHtml', () => {
  it('wraps paragraphs and line breaks', () => {
    expect(plainTextToEditorHtml('Line one\nLine two\n\nNext block')).toBe(
      '<p>Line one<br>Line two</p><p>Next block</p>',
    );
  });

  it('passes through existing HTML', () => {
    expect(plainTextToEditorHtml('<p>Hi</p>')).toBe('<p>Hi</p>');
  });
});

describe('richTextToPlainText', () => {
  it('strips tags for share/email bodies', () => {
    expect(richTextToPlainText('<p>Thank you!</p><p>Be blessed</p>')).toBe(
      'Thank you!\nBe blessed',
    );
  });
});
