'use client';

import Link from 'next/link';
import { useCallback } from 'react';

import { SortableTh } from '@/components/ui/SortableTh';
import { useSortableRows } from '@/hooks/use-sortable-rows';

import type { Song } from '../../types';

type SongCatalogProps = {
  songs: Song[];
};

type SongSortKey = 'title' | 'artist' | 'themes' | 'lyrics' | 'reference';

export function SongCatalog({ songs }: SongCatalogProps) {
  const getSortValue = useCallback((song: Song, key: SongSortKey) => {
    switch (key) {
      case 'title':
        return song.title;
      case 'artist':
        return song.artist ?? '';
      case 'themes':
        return song.themes.join(', ');
      case 'lyrics':
        return song.lyricsText ? 1 : 0;
      case 'reference':
        return song.youtubeUrl && !song.youtubeUrl.includes('placeholder') ? 1 : 0;
      default:
        return '';
    }
  }, []);

  const { sortedRows, sort, onSort } = useSortableRows<Song, SongSortKey>(
    songs,
    getSortValue,
    { key: 'title', direction: 'asc' },
  );

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {sortedRows.map((song) => (
          <li key={song.id}>
            <Link
              href={`/music/songs/${song.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 active:bg-slate-50"
            >
              <p className="font-medium text-ebc-burgundy">{song.title}</p>
              {song.artist && <p className="mt-1 text-sm text-slate-600">{song.artist}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {song.themes.slice(0, 3).map((theme) => (
                  <span
                    key={theme}
                    className="rounded bg-ebc-burgundy/10 px-2 py-0.5 text-xs text-ebc-burgundy"
                  >
                    {theme.replace(/_/g, ' ')}
                  </span>
                ))}
                {song.lyricsText ? (
                  <span className="text-xs font-medium text-green-700">Lyrics</span>
                ) : null}
                {song.youtubeUrl && !song.youtubeUrl.includes('placeholder') ? (
                  <span className="text-xs text-blue-700">YouTube</span>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-xs">
            <tr>
              <SortableTh label="Title" columnKey="title" sort={sort} onSort={onSort} />
              <SortableTh label="Artist" columnKey="artist" sort={sort} onSort={onSort} />
              <SortableTh label="Themes" columnKey="themes" sort={sort} onSort={onSort} />
              <SortableTh label="Lyrics" columnKey="lyrics" sort={sort} onSort={onSort} />
              <SortableTh
                label="Reference"
                columnKey="reference"
                sort={sort}
                onSort={onSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((song) => (
              <tr key={song.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <Link
                    href={`/music/songs/${song.id}`}
                    className="font-medium text-ebc-burgundy hover:underline"
                  >
                    {song.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{song.artist ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {song.themes.map((theme) => (
                      <span
                        key={theme}
                        className="rounded bg-ebc-burgundy/10 px-2 py-0.5 text-xs text-ebc-burgundy"
                      >
                        {theme.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {song.lyricsText ? (
                    <Link
                      href={`/music/songs/${song.id}`}
                      className="text-green-700 hover:underline"
                    >
                      View
                    </Link>
                  ) : (
                    <span className="text-slate-400">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {song.youtubeUrl && !song.youtubeUrl.includes('placeholder') ? (
                    <a
                      href={song.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      YouTube
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
