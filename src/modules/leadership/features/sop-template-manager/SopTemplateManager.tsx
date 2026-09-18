'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  deleteSopTemplateAction,
  saveSopTemplateAction,
} from '@/modules/leadership/actions/sop-config.actions';
import { ALL_CATEGORIES, ALL_SECTION_IDS } from '@/modules/leadership/data/sop-config.seed';
import type { SopConfigStore, SopSectionId, SopTemplateConfig } from '@/modules/leadership/types';
import { MINISTRY_CATEGORIES } from '@/modules/ministries/types';

export type SopTemplateManagerProps = {
  config: SopConfigStore;
};

const EMPTY_TEMPLATE: Omit<SopTemplateConfig, 'id'> = {
  label: '',
  description: '',
  categories: ['fellowship'],
  suggestedTitle: '',
  prefill: {},
  enabled: true,
  kind: 'task',
};

export function SopTemplateManager({ config }: SopTemplateManagerProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<SopTemplateConfig | null>(null);
  const [isNew, setIsNew] = useState(false);

  function openNew() {
    setEditing({ ...EMPTY_TEMPLATE, id: '' });
    setIsNew(true);
  }

  function openEdit(template: SopTemplateConfig) {
    setEditing({ ...template, prefill: { ...template.prefill } });
    setIsNew(false);
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;

    const formData = new FormData(e.currentTarget);
    const categories = ALL_CATEGORIES.filter((c) => formData.get(`cat-${c}`) === 'on');

    const prefill: Partial<Record<SopSectionId, string>> = {};
    for (const sectionId of ALL_SECTION_IDS) {
      const value = String(formData.get(`prefill-${sectionId}`) ?? '').trim();
      if (value) prefill[sectionId] = value;
    }

    startTransition(async () => {
      await saveSopTemplateAction({
        id: isNew ? undefined : editing.id,
        label: String(formData.get('label') ?? ''),
        description: String(formData.get('description') ?? ''),
        suggestedTitle: String(formData.get('suggestedTitle') ?? ''),
        categories: categories.length > 0 ? categories : ['fellowship'],
        prefill,
        enabled: formData.get('enabled') === 'on',
        kind: formData.get('kind') === 'charter' ? 'charter' : 'task',
      });
      setEditing(null);
      router.refresh();
    });
  }

  async function handleDelete(id: string): Promise<void> {
    const confirmed = await confirm({
      title: 'Delete this template?',
      description: 'Ministries can no longer start new SOPs from it.',
      confirmLabel: 'Delete template',
      tone: 'danger',
    });
    if (!confirmed) return;
    startTransition(async () => {
      await deleteSopTemplateAction(id);
      toast({ title: 'Template deleted', tone: 'success' });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/leadership" className="text-sm font-medium text-ebc-navy hover:underline">
            ← Leadership
          </Link>
          <h2 className="mt-2 text-xl font-bold text-ebc-burgundy">SOP templates</h2>
          <p className="text-sm text-slate-500">
            {config.templates.length} templates · ministry leaders pick from these when creating
            SOPs
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white"
        >
          New template
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="ebc-card space-y-4">
          <h3 className="font-bold text-slate-900">
            {isNew ? 'Create template' : `Edit: ${editing.label}`}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Label *</span>
              <input
                name="label"
                required
                defaultValue={editing.label}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Suggested title</span>
              <input
                name="suggestedTitle"
                defaultValue={editing.suggestedTitle}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Description</span>
            <input
              name="description"
              defaultValue={editing.description}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Template kind</span>
            <select
              name="kind"
              defaultValue={editing.kind ?? 'task'}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="task">Task procedure</option>
              <option value="charter">Ministry charter (CLC)</option>
            </select>
          </label>
          <fieldset>
            <legend className="text-sm font-medium">Show for ministry categories</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {ALL_CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`cat-${cat}`}
                    defaultChecked={editing.categories.includes(cat)}
                  />
                  {MINISTRY_CATEGORIES[cat].label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="enabled" defaultChecked={editing.enabled} />
            Enabled — visible to ministry leaders
          </label>
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-700">Prefill sections (optional)</p>
            <div className="mt-3 space-y-3">
              {config.sections.map((section) => (
                <label key={section.id} className="block">
                  <span className="text-xs text-slate-500">{section.label}</span>
                  <textarea
                    name={`prefill-${section.id}`}
                    rows={2}
                    defaultValue={editing.prefill[section.id] ?? ''}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save template'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {config.templates.map((template) => (
          <article
            key={template.id}
            className="ebc-card flex flex-wrap items-start justify-between gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900">{template.label}</h3>
                {template.kind === 'charter' ? (
                  <span className="rounded bg-ebc-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase text-ebc-navy">
                    Charter
                  </span>
                ) : null}
                {!template.enabled ? (
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                    Disabled
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-600">{template.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                Categories:{' '}
                {template.categories
                  .map((c) => MINISTRY_CATEGORIES[c].label)
                  .join(' · ')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(template)}
                className="text-sm font-medium text-ebc-navy hover:underline"
              >
                Edit
              </button>
              {template.id !== 'general' && template.id !== 'ministry_charter' ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleDelete(template.id);
                  }}
                  disabled={isPending}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
