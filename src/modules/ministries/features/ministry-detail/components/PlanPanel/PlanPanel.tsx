'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { updateMinistryMetadataAction } from '@/modules/ministries/actions/ministry.actions';
import type { Ministry, MinistryCategory } from '@/modules/ministries/types';
import { MINISTRY_CATEGORIES } from '@/modules/ministries/types';
import { buildMinistryPlanSignals } from '@/modules/ministries/utils/ministry-plan.utils';

import { useMinistryPlanHelp } from './use-ministry-plan-help';

export type PlanPanelProps = {
  ministry: Ministry;
  canManage?: boolean;
};

const CATEGORY_OPTIONS = Object.entries(MINISTRY_CATEGORIES) as [
  MinistryCategory,
  (typeof MINISTRY_CATEGORIES)[MinistryCategory],
][];

export function PlanPanel({ ministry, canManage = false }: PlanPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const category = MINISTRY_CATEGORIES[ministry.category];

  const signals = useMemo(() => buildMinistryPlanSignals(ministry), [ministry]);
  const {
    isConfigured,
    isLoading,
    error: planError,
    response,
    generatedAtLabel,
    requestPlan,
  } = useMinistryPlanHelp(ministry, { canRefresh: canManage });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateMinistryMetadataAction(ministry.slug, {
        name: String(formData.get('name') ?? ''),
        category: String(formData.get('category') ?? ministry.category),
        description: String(formData.get('description') ?? ''),
        meetingSummary: String(formData.get('meetingSummary') ?? ''),
        contactEmail: String(formData.get('contactEmail') ?? ''),
        websiteUrl: String(formData.get('websiteUrl') ?? ''),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setEditing(false);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-ebc-burgundy">Edit ministry details</h3>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ebc-card space-y-4">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Ministry title *</span>
            <input
              name="name"
              required
              defaultValue={ministry.name}
              maxLength={120}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category *</span>
            <select
              name="category"
              defaultValue={ministry.category}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {CATEGORY_OPTIONS.map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Description *</span>
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={ministry.description}
              maxLength={2000}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Meeting rhythm</span>
            <input
              name="meetingSummary"
              defaultValue={ministry.meetingSummary ?? ''}
              placeholder="e.g. Wed noon prayer + lunch"
              maxLength={200}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Ministry contact email</span>
            <input
              name="contactEmail"
              type="email"
              defaultValue={ministry.contactEmail ?? ''}
              placeholder="e.g. mediaministry@ebenezerbc.org"
              maxLength={200}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Shared inbox for the ministry — not a roster person’s personal email.
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Website URL</span>
            <input
              name="websiteUrl"
              type="url"
              defaultValue={ministry.websiteUrl ?? ''}
              placeholder="https://ebenezerbc.org/..."
              maxLength={500}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <p className="text-xs text-slate-500">
            URL slug stays <code className="rounded bg-slate-100 px-1">{ministry.slug}</code> so
            existing links keep working.
          </p>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white hover:bg-ebc-green-dark disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="ebc-card">
        <div className="flex items-start justify-between gap-4">
          <p className="ebc-section-label">{category.label}</p>
          {canManage ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 text-sm font-medium text-ebc-navy hover:underline"
            >
              Edit details
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-slate-700">{ministry.description}</p>
        {ministry.meetingSummary ? (
          <p className="mt-4 text-sm">
            <span className="font-semibold text-ebc-burgundy">Meeting rhythm: </span>
            {ministry.meetingSummary}
          </p>
        ) : null}
        {ministry.contactEmail ? (
          <p className="mt-2 text-sm">
            <span className="font-semibold text-ebc-burgundy">Contact: </span>
            <a
              href={`mailto:${ministry.contactEmail}`}
              className="font-medium text-ebc-navy hover:underline"
            >
              {ministry.contactEmail}
            </a>
          </p>
        ) : null}
        {ministry.websiteUrl ? (
          <a
            href={ministry.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-ebc-navy underline"
          >
            View on ebenezerbc.org →
          </a>
        ) : null}
      </div>

      <section className="ebc-card">
        <p className="ebc-section-label">Next 4 weeks</p>
        <h3 className="mt-1 text-lg font-bold text-ebc-burgundy">Needs attention</h3>
        {signals.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Nothing flagged from roster, calendar, duties, or SOPs right now.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {signals.map((signal) => (
              <li key={signal.id}>
                <Link
                  href={signal.href}
                  className={`block rounded-lg border p-4 transition hover:shadow-sm ${
                    signal.tone === 'urgent'
                      ? 'border-amber-200 bg-amber-50 hover:border-amber-300'
                      : 'border-slate-200 bg-white hover:border-ebc-burgundy/30'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{signal.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{signal.detail}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ebc-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="ebc-section-label">AI guidance</p>
            <h3 className="mt-1 text-lg font-bold text-ebc-burgundy">
              Suggested plan · next 4 weeks
            </h3>
            {generatedAtLabel ? (
              <p className="mt-1 text-xs text-slate-500">Updated {generatedAtLabel}</p>
            ) : null}
          </div>
          {canManage && isConfigured ? (
            <button
              type="button"
              onClick={() => void requestPlan()}
              disabled={isLoading}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isLoading ? 'Generating…' : 'Refresh'}
            </button>
          ) : null}
        </div>

        {canManage && isConfigured === null ? (
          <p className="mt-3 text-sm text-slate-500">Checking AI availability…</p>
        ) : null}

        {canManage && isConfigured === false ? (
          <p className="mt-3 text-sm text-slate-600">
            Cursor AI is not configured. Add{' '}
            <code className="rounded bg-slate-100 px-1">CURSOR_API_KEY</code> to enable
            week-by-week suggestions. The checklist above still works without AI.
          </p>
        ) : null}

        {planError ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {planError}
          </p>
        ) : null}

        {isLoading && !response ? (
          <p className="mt-3 text-sm text-slate-500">Building a 4-week plan for this ministry…</p>
        ) : null}

        {response ? (
          <div className={isLoading ? 'mt-4 opacity-60' : 'mt-4'}>
            <MarkdownContent className="text-sm leading-relaxed text-slate-700">
              {response}
            </MarkdownContent>
          </div>
        ) : null}

        {!response && !isLoading && isConfigured !== false ? (
          <p className="mt-3 text-sm text-slate-600">
            {canManage
              ? 'No suggested plan yet. Use Refresh to generate one, or wait for the daily background refresh.'
              : 'No suggested plan has been generated for this ministry yet.'}
          </p>
        ) : null}
      </section>
    </div>
  );
}
