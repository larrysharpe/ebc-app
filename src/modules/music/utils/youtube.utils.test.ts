import { describe, expect, it } from 'vitest';

import {
  extractYoutubeVideoId,
  isPlaceholderYoutubeUrl,
  toYoutubeEmbedUrl,
} from './youtube.utils';

describe('extractYoutubeVideoId', () => {
  it('parses youtu.be, watch, and music URLs', () => {
    expect(extractYoutubeVideoId('https://youtu.be/0m6EFPXm57g')).toBe('0m6EFPXm57g');
    expect(
      extractYoutubeVideoId('https://www.youtube.com/watch?v=JDAK23Be0RU&t=12'),
    ).toBe('JDAK23Be0RU');
    expect(
      extractYoutubeVideoId('https://music.youtube.com/watch?v=OzVMgpV3Ljs'),
    ).toBe('OzVMgpV3Ljs');
  });

  it('returns null for placeholders', () => {
    expect(extractYoutubeVideoId('https://youtu.be/placeholder-foo')).toBeNull();
  });
});

describe('toYoutubeEmbedUrl', () => {
  it('builds an embed URL', () => {
    expect(toYoutubeEmbedUrl('https://youtu.be/abc123XYZ00')).toBe(
      'https://www.youtube.com/embed/abc123XYZ00',
    );
  });
});

describe('isPlaceholderYoutubeUrl', () => {
  it('flags missing and placeholder URLs', () => {
    expect(isPlaceholderYoutubeUrl(undefined)).toBe(true);
    expect(isPlaceholderYoutubeUrl('https://youtu.be/placeholder-x')).toBe(true);
    expect(isPlaceholderYoutubeUrl('https://youtu.be/realId12345')).toBe(false);
  });
});
