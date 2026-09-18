'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { formatSuggestedPlanGeneratedAt } from '@/modules/ministries';

import { refreshChurchSuggestedPlanAction } from '../../actions/church-plan.actions';
import type { ChurchPlanViewModel } from '../../types/church-plan.types';

export type ChurchPlanPanelProps = {
  view: ChurchPlanViewModel;
  canRefresh: boolean;
  cursorConfigured: boolean;
};

export function ChurchPlanPanel({
  view,
  canRefresh,
  cursorConfigured,
}: ChurchPlanPanelProps): React.ReactElement {
  const [plan, setPlan] = useState(view.plan.suggestedPlan ?? '');
  const [generatedAt, setGeneratedAt] = useState(view.plan.suggestedPlanGeneratedAt ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const generatedAtLabel = generatedAt
    ? formatSuggestedPlanGeneratedAt(generatedAt)
    : null;

  function handleRefresh() {
    if (!canRefresh || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await refreshChurchSuggestedPlanAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPlan(result.suggestedPlan);
      setGeneratedAt(result.generatedAt);
    });
  }

  return (
    <div className="space-y-8">
      <section className="ebc-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="ebc-section-label">Church-wide</p>
            <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">
              Suggested plan · next 4 weeks
            </h2>
            {generatedAtLabel ? (
              <p className="mt-1 text-xs text-slate-500">Updated {generatedAtLabel}</p>
            ) : null}
            <p className="mt-2 text-sm text-slate-600">
              Rolled up from ministry needs and cached ministry plans (
              {view.ministriesWithPlan} of {view.rollup.length} ministries have plans ·{' '}
              {view.urgentCount} urgent items).
            </p>
          </div>
          {canRefresh && cursorConfigured ? (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isPending ? 'Generating…' : 'Refresh'}
            </button>
          ) : null}
        </div>

        {canRefresh && !cursorConfigured ? (
          <p className="mt-3 text-sm text-slate-600">
            Cursor AI is not configured. Add{' '}
            <code className="rounded bg-slate-100 px-1">CURSOR_API_KEY</code> to enable
            church-wide synthesis. The ministry rollup below still works.
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {isPending && !plan ? (
          <p className="mt-3 text-sm text-slate-500">Building the church-wide plan…</p>
        ) : null}

        {plan ? (
          <div className={isPending ? 'mt-4 opacity-60' : 'mt-4'}>
            <MarkdownContent className="text-sm leading-relaxed text-slate-700">
              {plan}
            </MarkdownContent>
          </div>
        ) : !isPending ? (
          <p className="mt-3 text-sm text-slate-600">
            {canRefresh
              ? 'No church plan yet. Use Refresh after ministry plans have been generated, or wait for the background job.'
              : 'No church plan has been generated yet.'}
          </p>
        ) : null}
      </section>

      <section className="ebc-card">
        <p className="ebc-section-label">Rollup</p>
        <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Ministry needs</h2>
        <p className="mt-1 text-sm text-slate-600">
          Deterministic signals from each ministry Plan tab — open a ministry for details.
        </p>

        {view.rollup.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No ministries found.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {view.rollup.map((entry) => {
              const signalCount = entry.urgentSignals.length + entry.normalSignals.length;
              return (
                <li key={entry.slug} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`/ministries/${entry.slug}`}
                      className="font-semibold text-ebc-burgundy hover:underline"
                    >
                      {entry.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {entry.planExcerpt ? 'Has suggested plan' : 'No ministry plan yet'}
                      {signalCount > 0 ? ` · ${signalCount} needs` : ''}
                    </p>
                  </div>
                  {entry.urgentSignals.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {entry.urgentSignals.map((line) => (
                        <li key={line} className="text-sm text-amber-800">
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {entry.normalSignals.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {entry.normalSignals.map((line) => (
                        <li key={line} className="text-sm text-slate-600">
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {signalCount === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">No flagged needs right now.</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
