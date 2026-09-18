import Link from 'next/link';

import type { Song } from '../../types';
import { SLOT_TYPE_LABELS } from '../../types';
import { getChoirName } from '../../utils/choir.utils';
import { formatServiceDate } from '../../utils/music.format';
import type { SongPerformance } from '../../utils/song-history.utils';
import { getLastSungPerformance } from '../../utils/song-history.utils';
import { SongMediaResources } from './SongMediaResources';

type SongDetailProps = {
  song: Song;
  performances: SongPerformance[];
};

export function SongDetail({ song, performances }: SongDetailProps) {
  const lastSung = getLastSungPerformance(performances);
  const pastPerformances = performances.filter(
    (p) => !lastSung || p.planId !== lastSung.planId || p.serviceDate !== lastSung.serviceDate,
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/music/songs" className="text-sm text-ebc-burgundy hover:underline">
          ← Song catalog
        </Link>
        <h2 className="mt-2 font-display text-2xl text-ebc-burgundy">{song.title}</h2>
        {song.artist && <p className="text-slate-600">{song.artist}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {song.themes.map((theme) => (
          <span
            key={theme}
            className="rounded bg-ebc-burgundy/10 px-2 py-0.5 text-xs font-medium text-ebc-burgundy"
          >
            {theme.replace(/_/g, ' ')}
          </span>
        ))}
        {song.defaultKey && (
          <span className="rounded bg-ebc-gold/20 px-2 py-0.5 text-xs font-medium text-ebc-burgundy">
            Key: {song.defaultKey}
          </span>
        )}
      </div>

      {song.notes && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">Director note:</span> {song.notes}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-900">Rehearsal resources</h3>
        <p className="mt-1 text-sm text-slate-600">
          Video, music, and lyrics for choir members.
        </p>
        <div className="mt-4">
          <SongMediaResources song={song} />
        </div>
      </section>

      {lastSung ? (
        <section className="rounded-xl border border-ebc-burgundy/20 bg-gradient-to-br from-ebc-burgundy/5 to-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ebc-gold">
            Last sung
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {formatServiceDate(lastSung.serviceDate)}
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Sung by
              </dt>
              <dd className="mt-1 font-medium text-ebc-burgundy">{lastSung.assignments}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Choir
              </dt>
              <dd className="mt-1 text-slate-800">
                {getChoirName(lastSung.choirGroup)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Service slot
              </dt>
              <dd className="mt-1 text-slate-800">{SLOT_TYPE_LABELS[lastSung.slotType]}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Director
              </dt>
              <dd className="mt-1 text-slate-800">{lastSung.directorName}</dd>
            </div>
          </dl>
          <Link
            href={`/music/plans/${lastSung.planId}`}
            className="mt-4 inline-block text-sm font-medium text-ebc-burgundy hover:underline"
          >
            View {lastSung.planTitle} →
          </Link>
          {lastSung.status === 'draft' && (
            <p className="mt-2 text-xs text-amber-700">
              Scheduled in a draft plan — not yet marked sent.
            </p>
          )}
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          Not yet on a choir plan — no performance history.
        </section>
      )}

      {pastPerformances.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="font-semibold text-slate-900">Previous services</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {pastPerformances.map((perf) => (
              <li
                key={`${perf.planId}-${perf.serviceDate}-${perf.assignments}`}
                className="px-6 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">
                      {formatServiceDate(perf.serviceDate)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {perf.assignments} · {getChoirName(perf.choirGroup)}
                    </p>
                  </div>
                  <Link
                    href={`/music/plans/${perf.planId}`}
                    className="text-sm text-ebc-burgundy hover:underline"
                  >
                    Plan
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
