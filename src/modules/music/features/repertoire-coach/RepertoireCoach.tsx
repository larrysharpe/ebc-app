'use client';

import Link from 'next/link';

import { MarkdownContent } from '@/components/ui/MarkdownContent';

import { formatServiceDate } from '../../utils/music.format';
import type { RepertoireSongStat } from '../../utils/repertoire.utils';
import { REPERTOIRE_COACH_EMPTY } from './repertoire-coach.constants';
import type { RepertoireCoachProps } from './repertoire-coach.types';
import { useRepertoireCoach } from './use-repertoire-coach';

function SongStatRow({
  stat,
  detail,
}: {
  stat: RepertoireSongStat;
  detail: string;
}) {
  return (
    <li>
      <Link
        href={`/music/songs/${stat.songId}`}
        className="block rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:border-ebc-burgundy/40"
      >
        <p className="font-medium text-slate-900">{stat.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
      </Link>
    </li>
  );
}

function trendingDetail(stat: RepertoireSongStat): string {
  const last = stat.lastSungDate
    ? formatServiceDate(stat.lastSungDate)
    : 'recently';
  return `${stat.timesSung}× on sent plans · last ${last}`;
}

function restingDetail(stat: RepertoireSongStat): string {
  const days = stat.daysSinceLastSung ?? '?';
  return `${days} days since last sung · good candidate to revisit or rest`;
}

export function RepertoireCoach({ snapshot, canRefresh }: RepertoireCoachProps) {
  const {
    isConfigured,
    isLoading,
    error,
    guidance,
    generatedAtLabel,
    requestGuidance,
  } = useRepertoireCoach({ canRefresh });

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ebc-burgundy/70">
          Repertoire
        </p>
        <h2 className="mt-1 font-display text-xl text-ebc-burgundy">
          What&apos;s trending &amp; what to work next
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          From your sent choir plans — then AI coaching for rehearsals.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <h3 className="text-sm font-bold text-slate-900">Trending lately</h3>
          {snapshot.trending.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              No songs on sent plans in the last 90 days yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {snapshot.trending.slice(0, 5).map((stat) => (
                <SongStatRow
                  key={stat.songId}
                  stat={stat}
                  detail={trendingDetail(stat)}
                />
              ))}
            </ul>
          )}
          {snapshot.recentThemes.length > 0 ? (
            <p className="mt-3 text-xs text-slate-500">
              Themes: {snapshot.recentThemes.join(' · ')}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <h3 className="text-sm font-bold text-slate-900">
            Bring back or develop
          </h3>
          {snapshot.resting.length === 0 && snapshot.neverSung.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              Catalog looks active — no long-resting or never-sung titles flagged.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {snapshot.resting.slice(0, 3).map((stat) => (
                <SongStatRow
                  key={`rest-${stat.songId}`}
                  stat={stat}
                  detail={restingDetail(stat)}
                />
              ))}
              {snapshot.neverSung.slice(0, 3).map((stat) => (
                <SongStatRow
                  key={`new-${stat.songId}`}
                  stat={stat}
                  detail="In catalog · never on a sent plan — good development pick"
                />
              ))}
            </ul>
          )}
          <Link
            href="/music/songs"
            className="mt-3 inline-block text-sm font-medium text-ebc-burgundy hover:underline"
          >
            Open song catalog →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-ebc-burgundy/20 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ebc-burgundy/70">
              AI guidance
            </p>
            <h3 className="mt-1 text-lg font-bold text-ebc-burgundy">
              Repertoire coach
            </h3>
            {generatedAtLabel ? (
              <p className="mt-1 text-xs text-slate-500">
                Updated {generatedAtLabel}
              </p>
            ) : null}
          </div>
          {canRefresh && isConfigured ? (
            <button
              type="button"
              onClick={() => void requestGuidance()}
              disabled={isLoading}
              className="rounded-lg bg-ebc-burgundy px-3 py-1.5 text-sm font-medium text-white hover:bg-ebc-burgundy/90 disabled:opacity-50"
            >
              {isLoading
                ? 'Coaching…'
                : guidance
                  ? 'Refresh coaching'
                  : 'Get AI coaching'}
            </button>
          ) : null}
        </div>

        {canRefresh && isConfigured === null ? (
          <p className="mt-3 text-sm text-slate-500">Checking AI availability…</p>
        ) : null}

        {canRefresh && isConfigured === false ? (
          <p className="mt-3 text-sm text-slate-600">
            Cursor AI is not configured. Add{' '}
            <code className="rounded bg-slate-100 px-1">CURSOR_API_KEY</code> to
            enable repertoire coaching. Trending lists above still work without
            AI.
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {isLoading && !guidance ? (
          <p className="mt-3 text-sm text-slate-500">
            Reviewing plans and catalog for rehearsal ideas…
          </p>
        ) : null}

        {guidance ? (
          <div className={isLoading ? 'mt-4 opacity-60' : 'mt-4'}>
            <MarkdownContent className="text-sm leading-relaxed text-slate-700">
              {guidance}
            </MarkdownContent>
          </div>
        ) : null}

        {!guidance && !isLoading && isConfigured !== false ? (
          <p className="mt-3 text-sm text-slate-600">
            {canRefresh ? REPERTOIRE_COACH_EMPTY : 'No repertoire guidance yet.'}
          </p>
        ) : null}
      </div>
    </section>
  );
}
