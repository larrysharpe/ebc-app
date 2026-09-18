'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { updateSopSectionsAction } from '@/modules/leadership/actions/sop-config.actions';
import type { SopConfigStore } from '@/modules/leadership/types';

export type SopGuidanceEditorProps = {
  config: SopConfigStore;
};

export function SopGuidanceEditor({ config }: SopGuidanceEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const sections = config.sections.map((section) => ({
      ...section,
      hint: String(formData.get(`hint-${section.id}`) ?? section.hint),
      placeholder: String(formData.get(`placeholder-${section.id}`) ?? section.placeholder),
      required: formData.get(`required-${section.id}`) === 'on',
    }));

    startTransition(async () => {
      await updateSopSectionsAction(sections);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/leadership" className="text-sm font-medium text-ebc-navy hover:underline">
          ← Leadership
        </Link>
        <h2 className="mt-2 text-xl font-bold text-ebc-burgundy">Section guidance</h2>
        <p className="text-sm text-slate-500">
          Hints and placeholders shown to every ministry leader in the guided SOP editor.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {config.sections.map((section) => (
          <div key={section.id} className="ebc-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{section.label}</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`required-${section.id}`}
                  defaultChecked={section.required}
                />
                Required for quality
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Hint</span>
              <input
                name={`hint-${section.id}`}
                defaultValue={section.hint}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Placeholder example</span>
              <textarea
                name={`placeholder-${section.id}`}
                rows={2}
                defaultValue={section.placeholder}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
              />
            </label>
          </div>
        ))}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save guidance'}
        </button>
      </form>
    </div>
  );
}
