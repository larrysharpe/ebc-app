'use client';

import { useState } from 'react';

import type { ServiceMusicPlan, Song } from '@/modules/music/types';

import { PlanEmailPreview } from '../PlanEmailPreview';

type PreviewTab = 'formatted' | 'plain';

export type PlanPreviewPanelProps = {
  plan: ServiceMusicPlan;
  songs: Song[];
  plainText: string;
};

export function PlanPreviewPanel({ plan, songs, plainText }: PlanPreviewPanelProps) {
  const [tab, setTab] = useState<PreviewTab>('formatted');

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Plan preview</h3>
          <p className="mt-0.5 text-sm text-slate-600">
            Formatted view for reading, or plain text to copy into email / group text.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Plan preview format">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'formatted'}
            onClick={() => setTab('formatted')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === 'formatted'
                ? 'bg-ebc-burgundy text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-ebc-burgundy/40'
            }`}
          >
            Formatted
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'plain'}
            onClick={() => setTab('plain')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === 'plain'
                ? 'bg-ebc-burgundy text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-ebc-burgundy/40'
            }`}
          >
            Plain text
          </button>
        </div>
      </div>

      {tab === 'formatted' ? (
        <div role="tabpanel">
          <PlanEmailPreview plan={plan} songs={songs} />
        </div>
      ) : (
        <div
          role="tabpanel"
          className="rounded-xl border border-slate-200 bg-white p-5"
        >
          <p className="text-xs text-slate-500">
            Copy this into email or group text — matches Sister Stewart&apos;s format.
          </p>
          <pre className="mt-4 max-h-[32rem] overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
            {plainText}
          </pre>
        </div>
      )}
    </section>
  );
}
