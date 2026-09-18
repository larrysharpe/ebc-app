'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { submitSongRequestAction } from '@/modules/music/actions/song-request.actions';

export function SongRequestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [defaultKey, setDefaultKey] = useState('');
  const [themes, setThemes] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  function resetForm() {
    setTitle('');
    setArtist('');
    setYoutubeUrl('');
    setAudioUrl('');
    setDefaultKey('');
    setThemes('');
    setReason('');
    setNotes('');
  }

  function handleSubmit() {
    setError(null);
    setOkMessage(null);
    startTransition(async () => {
      const result = await submitSongRequestAction({
        title,
        artist: artist || undefined,
        youtubeUrl: youtubeUrl || undefined,
        audioUrl: audioUrl || undefined,
        defaultKey: defaultKey || undefined,
        themes,
        reason: reason || undefined,
        notes: notes || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      resetForm();
      setOkMessage('Request sent — a director will review it for the catalog.');
      router.refresh();
    });
  }

  return (
    <section className="ebc-card space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ebc-burgundy">Request a song</h2>
        <p className="mt-1 text-sm text-slate-600">
          Suggest a song for the repertoire. Directors review requests and add approved
          songs to the catalog.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {okMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {okMessage}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Song title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Total Praise"
            disabled={isPending}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Artist / composer</span>
          <input
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Optional"
            disabled={isPending}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Default key</span>
          <input
            value={defaultKey}
            onChange={(event) => setDefaultKey(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="e.g. Db"
            disabled={isPending}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">YouTube link</span>
          <input
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="https://…"
            disabled={isPending}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Practice audio link</span>
          <input
            value={audioUrl}
            onChange={(event) => setAudioUrl(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="https://…"
            disabled={isPending}
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Themes</span>
          <input
            value={themes}
            onChange={(event) => setThemes(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="praise, advent (comma-separated)"
            disabled={isPending}
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Why this song?</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Optional — helpful for the director"
            disabled={isPending}
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-[56px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Optional arrangement or copyright notes"
            disabled={isPending}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || !title.trim()}
        className="rounded-lg bg-ebc-burgundy px-4 py-2.5 text-sm font-semibold text-white hover:bg-ebc-burgundy/90 disabled:opacity-50"
      >
        {isPending ? 'Sending…' : 'Submit request'}
      </button>
    </section>
  );
}
