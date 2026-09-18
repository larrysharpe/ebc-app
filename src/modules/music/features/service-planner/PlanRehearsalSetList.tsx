'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { PlanSongSlot, ServiceMusicPlan, Song } from '../../types';
import { SLOT_TYPE_LABELS } from '../../types';
import {
  resolveSlotArtist,
  resolveSlotTitle,
  songsToMap,
} from '../../utils/music.format';
import {
  SongMediaResources,
  songMediaAvailability,
} from '../song-catalog/SongMediaResources';

export type PlanRehearsalSetListProps = {
  plan: ServiceMusicPlan;
  songs: Song[];
};

function MediaBadges({ song }: { song: Song }) {
  const availability = songMediaAvailability(song);
  const items = [
    availability.video ? 'Video' : null,
    availability.music ? 'Music' : null,
    availability.lyrics ? 'Lyrics' : null,
  ].filter(Boolean);

  if (items.length === 0) {
    return <span className="text-xs text-slate-400">No media yet</span>;
  }

  return (
    <span className="flex flex-wrap gap-1">
      {items.map((label) => (
        <span
          key={label}
          className="rounded bg-ebc-burgundy/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ebc-burgundy"
        >
          {label}
        </span>
      ))}
    </span>
  );
}

function SongCard({
  slot,
  song,
  title,
  artist,
}: {
  slot: PlanSongSlot;
  song?: Song;
  title: string;
  artist?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
        aria-expanded={open}
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ebc-burgundy/10 text-sm font-bold text-ebc-burgundy">
          {slot.sortOrder}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-ebc-gold">
              {SLOT_TYPE_LABELS[slot.slotType]}
            </span>
            {title}
          </p>
          {artist ? <p className="text-sm text-slate-600">{artist}</p> : null}
          {slot.sectionNotes ? (
            <p className="mt-1 text-sm italic text-slate-600">{slot.sectionNotes}</p>
          ) : null}
          <div className="mt-2">{song ? <MediaBadges song={song} /> : null}</div>
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-500">
          {open ? 'Hide' : 'Open'}
        </span>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-slate-100 px-4 py-4">
          {song ? (
            <>
              <SongMediaResources song={song} compact />
              <Link
                href={`/music/songs/${song.id}`}
                className="inline-block text-sm font-medium text-ebc-burgundy hover:underline"
              >
                Open full song page →
              </Link>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Custom title — not linked to the song catalog, so media is unavailable.
            </p>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function PlanRehearsalSetList({ plan, songs }: PlanRehearsalSetListProps) {
  const songsById = songsToMap(songs);
  const sorted = [...plan.songs].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
        <h3 className="font-semibold text-slate-900">Set list</h3>
        <p className="mt-2 text-sm text-slate-600">
          No songs on this plan yet. Choir directors can add songs from the catalog.
        </p>
      </section>
    );
  }

  return (
    <ol className="space-y-3">
      {sorted.map((slot) => {
        const song = slot.songId ? songsById.get(slot.songId) : undefined;
        return (
          <SongCard
            key={slot.id}
            slot={slot}
            song={song}
            title={resolveSlotTitle(slot, songsById)}
            artist={resolveSlotArtist(slot, songsById)}
          />
        );
      })}
    </ol>
  );
}
