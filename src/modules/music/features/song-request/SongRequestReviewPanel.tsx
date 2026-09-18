'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  approveSongRequestAction,
  declineSongRequestAction,
  deleteSongRequestAction,
} from '@/modules/music/actions/song-request.actions';
import {
  SONG_REQUEST_STATUS_LABELS,
  type SongRequest,
} from '@/modules/music/types/song-request.types';

export type SongRequestReviewPanelProps = {
  requests: SongRequest[];
};

export function SongRequestReviewPanel({ requests }: SongRequestReviewPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  function runAction(
    action: () => Promise<{ ok: boolean; error?: string }>,
    successMessage: string,
  ) {
    setError(null);
    setOkMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      setOkMessage(successMessage);
      router.refresh();
    });
  }

  const pending = requests.filter((item) => item.status === 'pending');
  const others = requests.filter((item) => item.status !== 'pending');

  return (
    <div className="space-y-8">
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

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-ebc-burgundy">Pending requests</h2>
          <p className="mt-1 text-sm text-slate-600">
            Approve to add the song to the catalog, or decline with an optional note.
          </p>
        </div>

        {pending.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            No pending song requests.
          </p>
        ) : (
          <ul className="space-y-3">
            {pending.map((request) => (
              <li
                key={request.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{request.title}</p>
                  <p className="text-sm text-slate-600">
                    {[request.artist, request.defaultKey ? `Key ${request.defaultKey}` : null]
                      .filter(Boolean)
                      .join(' · ') || 'No artist listed'}
                  </p>
                  {request.requestedByName ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Requested by {request.requestedByName}
                      {request.createdAt
                        ? ` · ${new Date(request.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}`
                        : null}
                    </p>
                  ) : null}
                  {request.reason ? (
                    <p className="mt-2 text-sm text-slate-700">{request.reason}</p>
                  ) : null}
                  {request.themes.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {request.themes.map((theme) => (
                        <span
                          key={theme}
                          className="rounded bg-ebc-burgundy/10 px-2 py-0.5 text-xs text-ebc-burgundy"
                        >
                          {theme.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    {request.youtubeUrl ? (
                      <a
                        href={request.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-700 hover:underline"
                      >
                        YouTube
                      </a>
                    ) : null}
                    {request.audioUrl ? (
                      <a
                        href={request.audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-700 hover:underline"
                      >
                        Audio
                      </a>
                    ) : null}
                  </div>
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-600">Review note</span>
                  <input
                    value={notesById[request.id] ?? ''}
                    onChange={(event) =>
                      setNotesById((prev) => ({
                        ...prev,
                        [request.id]: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Optional"
                    disabled={isPending}
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      runAction(
                        () =>
                          approveSongRequestAction({
                            id: request.id,
                            reviewNotes: notesById[request.id] || undefined,
                          }),
                        'Added to the song catalog.',
                      )
                    }
                    className="rounded-lg bg-ebc-burgundy px-3 py-2 text-sm font-semibold text-white hover:bg-ebc-burgundy/90 disabled:opacity-50"
                  >
                    Add to catalog
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      runAction(
                        () =>
                          declineSongRequestAction({
                            id: request.id,
                            reviewNotes: notesById[request.id] || undefined,
                          }),
                        'Request declined.',
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      runAction(
                        () => deleteSongRequestAction({ id: request.id }),
                        'Request removed.',
                      )
                    }
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {others.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ebc-burgundy">Recent decisions</h2>
          <ul className="space-y-2">
            {others.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{request.title}</p>
                  <p className="text-xs text-slate-500">
                    {SONG_REQUEST_STATUS_LABELS[request.status]}
                    {request.requestedByName ? ` · ${request.requestedByName}` : ''}
                  </p>
                </div>
                {request.songId ? (
                  <Link
                    href={`/music/songs/${request.songId}`}
                    className="text-sm font-medium text-ebc-burgundy hover:underline"
                  >
                    View in catalog
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
