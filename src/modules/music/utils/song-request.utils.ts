import type { Song } from '../types';
import type { SongRequest } from '../types/song-request.types';

export function songFromApprovedRequest(request: SongRequest): Song {
  const themes = normalizeSongThemes(request.themes);
  return {
    id: `song-${Date.now()}`,
    title: request.title,
    artist: request.artist,
    youtubeUrl: request.youtubeUrl,
    audioUrl: request.audioUrl,
    defaultKey: request.defaultKey,
    themes: themes.length > 0 ? themes : ['general'],
    notes: request.notes,
  };
}

export function normalizeSongThemes(themes: string[]): string[] {
  const cleaned = themes
    .map((theme) =>
      theme
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
    )
    .filter(Boolean);
  return [...new Set(cleaned)];
}
