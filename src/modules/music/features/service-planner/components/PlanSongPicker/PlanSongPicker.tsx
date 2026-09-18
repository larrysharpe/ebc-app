'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { Song } from '@/modules/music/types';
import { songMediaAvailability } from '@/modules/music/features/song-catalog/SongMediaResources';

import { filterCatalogSongs } from './plan-song-picker.utils';

export type PlanSongPickerProps = {
  songs: Song[];
  value: string;
  onChange: (songId: string) => void;
  disabled?: boolean;
  /** Shorter chrome for the focused mobile pick step. */
  compact?: boolean;
};

export function PlanSongPicker({
  songs,
  value,
  onChange,
  disabled = false,
  compact = false,
}: PlanSongPickerProps) {
  const [query, setQuery] = useState('');
  const filtered = filterCatalogSongs(songs, query);
  const selected = songs.find((song) => song.id === value) ?? null;

  if (songs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        No songs in the catalog yet.{' '}
        <Link href="/music/songs" className="font-medium text-ebc-burgundy hover:underline">
          Add songs
        </Link>{' '}
        first, then come back to build the set list.
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <label className="block">
        {compact ? (
          <span className="sr-only">Search catalog</span>
        ) : (
          <span className="text-sm font-medium text-slate-700">Search catalog</span>
        )}
        <input
          type="search"
          value={query}
          disabled={disabled}
          autoFocus={compact}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, artist, or theme…"
          className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm disabled:opacity-50 ${
            compact ? '' : 'mt-1'
          }`}
        />
      </label>

      {selected && !compact ? (
        <div className="rounded-lg border border-ebc-burgundy/30 bg-ebc-burgundy/5 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ebc-burgundy">
            Selected song
          </p>
          <p className="mt-0.5 font-medium text-slate-900">{selected.title}</p>
          <p className="text-sm text-slate-600">
            {selected.artist ?? 'Unknown artist'}
            {(() => {
              const media = songMediaAvailability(selected);
              const tags = [
                media.video ? 'video' : null,
                media.music ? 'music' : null,
                media.lyrics ? 'lyrics' : null,
              ].filter(Boolean);
              return tags.length > 0 ? ` · ${tags.join(', ')}` : '';
            })()}
          </p>
        </div>
      ) : null}

      <ul
        className={`divide-y divide-slate-100 overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white ${
          compact ? 'max-h-48 sm:max-h-56' : 'max-h-56'
        }`}
        role="listbox"
        aria-label="Song catalog"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-slate-500">
            No songs match “{query.trim()}”.
          </li>
        ) : (
          filtered.map((song) => {
            const active = song.id === value;
            const media = songMediaAvailability(song);
            return (
              <li key={song.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => onChange(song.id)}
                  className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition disabled:opacity-50 ${
                    active ? 'bg-ebc-burgundy/10' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium text-slate-900">{song.title}</span>
                  <span className="text-xs text-slate-600">
                    {song.artist ?? 'Unknown artist'}
                    {media.video || media.music || media.lyrics
                      ? ` · ${[
                          media.video ? 'V' : null,
                          media.music ? 'M' : null,
                          media.lyrics ? 'L' : null,
                        ]
                          .filter(Boolean)
                          .join('')}`
                      : ''}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>

      {compact ? null : (
        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {songs.length} catalog songs.
        </p>
      )}
    </div>
  );
}
