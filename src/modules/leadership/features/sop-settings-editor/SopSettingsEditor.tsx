'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { updateSopSettingsAction } from '@/modules/leadership/actions/sop-config.actions';
import { ALL_CATEGORIES } from '@/modules/leadership/data/sop-config.seed';
import type { SopConfigStore } from '@/modules/leadership/types';
import { MINISTRY_CATEGORIES } from '@/modules/ministries/types';

export type SopSettingsEditorProps = {
  config: SopConfigStore;
};

export function SopSettingsEditor({ config }: SopSettingsEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const categoryDefaults = { ...config.categoryDefaults };
    for (const cat of ALL_CATEGORIES) {
      categoryDefaults[cat] = String(formData.get(`default-${cat}`) ?? 'general');
    }

    startTransition(async () => {
      await updateSopSettingsAction({
        minQualityScore: Number(formData.get('minQualityScore') ?? 70),
        categoryDefaults,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/leadership" className="text-sm font-medium text-ebc-navy hover:underline">
          ← Leadership
        </Link>
        <h2 className="mt-2 text-xl font-bold text-ebc-burgundy">SOP quality settings</h2>
        <p className="text-sm text-slate-500">
          Church-wide standards applied when ministry leaders write SOPs.
        </p>
      </div>

      <form onSubmit={handleSave} className="ebc-card max-w-xl space-y-6">
        <label className="block">
          <span className="text-sm font-medium">Minimum quality score to publish</span>
          <input
            name="minQualityScore"
            type="number"
            min={0}
            max={100}
            defaultValue={config.minQualityScore}
            className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">
            Ministry leaders see this target in the editor sidebar (currently {config.minQualityScore}
            ).
          </p>
        </label>

        <fieldset>
          <legend className="text-sm font-medium">Default template per ministry category</legend>
          <div className="mt-3 space-y-3">
            {ALL_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center justify-between gap-4 text-sm">
                <span>{MINISTRY_CATEGORIES[cat].label}</span>
                <select
                  name={`default-${cat}`}
                  defaultValue={config.categoryDefaults[cat]}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  {config.templates
                    .filter((t) => t.enabled)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                </select>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}
