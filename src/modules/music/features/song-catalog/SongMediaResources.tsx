'use client';

import { useState } from 'react';

import type { Song } from '../../types';
import {
  isPlaceholderYoutubeUrl,
  toYoutubeEmbedUrl,
} from '../../utils/youtube.utils';

export type SongMediaResourcesProps = {
  song: Song;
  /** Compact layout for plan set-list cards. */
  compact?: boolean;
  defaultTab?: SongMediaTab;
};

export type SongMediaTab = 'video' | 'music' | 'lyrics';

function resolveMusicUrl(song: Song): string | undefined {
  if (song.audioUrl && !isPlaceholderYoutubeUrl(song.audioUrl)) {
    return song.audioUrl;
  }
  if (song.youtubeUrl && !isPlaceholderYoutubeUrl(song.youtubeUrl)) {
    return song.youtubeUrl;
  }
  return undefined;
}

function isDirectAudioFile(url: string): boolean {
  return /\.(mp3|m4a|wav|ogg)(\?|$)/i.test(url);
}

export function SongMediaResources({
  song,
  compact = false,
  defaultTab,
}: SongMediaResourcesProps) {
  const embedUrl =
    song.youtubeUrl && !isPlaceholderYoutubeUrl(song.youtubeUrl)
      ? toYoutubeEmbedUrl(song.youtubeUrl)
      : null;
  const musicUrl = resolveMusicUrl(song);
  const hasLyrics = Boolean(song.lyricsText?.trim());

  const tabs: { id: SongMediaTab; label: string; available: boolean }[] = [
    { id: 'video', label: 'Video', available: Boolean(embedUrl) },
    { id: 'music', label: 'Music', available: Boolean(musicUrl) },
    { id: 'lyrics', label: 'Lyrics', available: hasLyrics },
  ];

  const firstAvailable =
    defaultTab && tabs.find((tab) => tab.id === defaultTab && tab.available)?.id;
  const initial =
    firstAvailable ?? tabs.find((tab) => tab.available)?.id ?? 'lyrics';

  const [tab, setTab] = useState<SongMediaTab>(initial);

  if (!embedUrl && !musicUrl && !hasLyrics) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
        No video, music, or lyrics on file yet for this song.
      </p>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={!item.available}
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === item.id && item.available
                ? 'bg-ebc-burgundy text-white'
                : item.available
                  ? 'border border-slate-200 bg-white text-slate-700 hover:border-ebc-burgundy/40'
                  : 'cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'video' && embedUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
          <div className="relative aspect-video w-full">
            <iframe
              title={`${song.title} reference video`}
              src={embedUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}

      {tab === 'music' && musicUrl ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm font-medium text-slate-900">Practice track</p>
          <p className="mt-1 text-xs text-slate-500">
            Use this to learn the song before rehearsal.
          </p>
          {isDirectAudioFile(musicUrl) ? (
            <audio controls className="mt-3 w-full" preload="none" src={musicUrl}>
              <track kind="captions" />
            </audio>
          ) : (
            <a
              href={musicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy/90"
            >
              Open music / listen →
            </a>
          )}
        </div>
      ) : null}

      {tab === 'lyrics' ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          {song.copyrightNotes ? (
            <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
              {song.copyrightNotes}
            </p>
          ) : null}
          {hasLyrics ? (
            <pre
              className={`whitespace-pre-wrap px-4 font-sans leading-relaxed text-slate-800 ${
                compact ? 'max-h-64 overflow-y-auto py-4 text-sm' : 'py-5 text-[15px]'
              }`}
            >
              {song.lyricsText}
            </pre>
          ) : (
            <p className="px-4 py-6 text-sm text-slate-500">
              Lyrics not yet added for this song.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function songMediaAvailability(song: Song): {
  video: boolean;
  music: boolean;
  lyrics: boolean;
} {
  return {
    video: Boolean(
      song.youtubeUrl &&
        !isPlaceholderYoutubeUrl(song.youtubeUrl) &&
        toYoutubeEmbedUrl(song.youtubeUrl),
    ),
    music: Boolean(resolveMusicUrl(song)),
    lyrics: Boolean(song.lyricsText?.trim()),
  };
}
