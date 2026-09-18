import type { Song } from '@/modules/music/types';

export function filterCatalogSongs(songs: readonly Song[], query: string): Song[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...songs];
  return songs.filter(
    (song) =>
      song.title.toLowerCase().includes(q) ||
      song.artist?.toLowerCase().includes(q) ||
      song.themes.some((theme) => theme.toLowerCase().includes(q)),
  );
}
