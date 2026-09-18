'use client';

import { useMemo, useState } from 'react';

import type { SopConfigStore } from '@/modules/leadership/types';
import type { Ministry, MinistrySop, MinistrySopStatus } from '@/modules/ministries/types';
import { MINISTRY_CATEGORIES } from '@/modules/ministries/types';

import type { SopDraft } from './sop-editor.types';
import {
  composeSopContent,
  createDraftFromTemplate,
  defaultSopKind,
  evaluateSopQuality,
  getTemplatesForCategory,
  isCharterTemplate,
  parseSopContent,
  visibleSectionsForDraft,
} from './sop-editor.utils';
import { SopQualityPanel } from './SopQualityPanel';
import { SopSectionHelp } from './components/SopSectionHelp';

export type SopSavePayload = {
  title: string;
  content: string;
  templateId: string;
  kind: 'charter' | 'task';
  documentNumber?: string;
  version: string;
  status: MinistrySopStatus;
  effectiveDate?: string;
  preparedBy?: string;
  reviewedBy?: string;
  nextReviewAt?: string;
};

export type SopGuidedEditorProps = {
  ministry: Ministry;
  sopConfig: SopConfigStore;
  initialSop?: MinistrySop;
  isPending: boolean;
  canApprove: boolean;
  onSave: (payload: SopSavePayload) => void;
  onCancel: () => void;
};

type EditorStep = 'template' | 'compose';

export function SopGuidedEditor({
  ministry,
  sopConfig,
  initialSop,
  isPending,
  canApprove,
  onSave,
  onCancel,
}: SopGuidedEditorProps) {
  const isNew = !initialSop;
  const [step, setStep] = useState<EditorStep>(isNew ? 'template' : 'compose');
  const [mode, setMode] = useState<'guided' | 'advanced'>('guided');
  const [rawContent, setRawContent] = useState(initialSop?.content ?? '');

  const defaultTemplateId =
    sopConfig.categoryDefaults[ministry.category] ?? 'general';

  const [draft, setDraft] = useState<SopDraft>(() =>
    initialSop
      ? parseSopContent(
          initialSop.content,
          initialSop.title,
          sopConfig.sections,
          initialSop.templateId ?? 'general',
        )
      : createDraftFromTemplate(defaultTemplateId, sopConfig),
  );

  const [documentNumber, setDocumentNumber] = useState(
    initialSop?.documentNumber ?? '',
  );
  const [version, setVersion] = useState(initialSop?.version ?? '1.0');
  const [effectiveDate, setEffectiveDate] = useState(
    initialSop?.effectiveDate ?? '',
  );
  const [preparedBy, setPreparedBy] = useState(initialSop?.preparedBy ?? '');
  const [reviewedBy, setReviewedBy] = useState(initialSop?.reviewedBy ?? '');
  const [nextReviewAt, setNextReviewAt] = useState(initialSop?.nextReviewAt ?? '');
  const [status, setStatus] = useState<MinistrySopStatus>(
    initialSop?.status ?? 'draft',
  );

  const templates = useMemo(
    () => getTemplatesForCategory(ministry.category, sopConfig),
    [ministry.category, sopConfig],
  );

  const requiresSafety =
    ministry.category === 'fellowship' ||
    ministry.category === 'outreach' ||
    ministry.category === 'education';

  const quality = useMemo(
    () => evaluateSopQuality(draft, sopConfig, { requiresSafety }),
    [draft, sopConfig, requiresSafety],
  );

  const visibleSections = useMemo(
    () => visibleSectionsForDraft(draft, sopConfig.sections, sopConfig),
    [draft, sopConfig],
  );

  const isCharter = isCharterTemplate(draft.templateId, sopConfig);

  function selectTemplate(templateId: string) {
    const template = sopConfig.templates.find((t) => t.id === templateId);
    setDraft(createDraftFromTemplate(templateId, sopConfig, template?.suggestedTitle));
    setStatus('draft');
    setStep('compose');
  }

  function updateSection(
    sectionId: keyof SopDraft['sections'],
    value: string,
  ) {
    setDraft((prev) => ({
      ...prev,
      sections: { ...prev.sections, [sectionId]: value },
    }));
  }

  function buildPayload(nextStatus: MinistrySopStatus): SopSavePayload {
    const content =
      mode === 'advanced' ? rawContent : composeSopContent(draft, sopConfig.sections);

    return {
      title: draft.title.trim(),
      content,
      templateId: draft.templateId,
      kind: defaultSopKind(draft.templateId, sopConfig),
      documentNumber: documentNumber.trim() || undefined,
      version: version.trim() || '1.0',
      status: nextStatus,
      effectiveDate: effectiveDate.trim() || undefined,
      preparedBy: preparedBy.trim() || undefined,
      reviewedBy: reviewedBy.trim() || undefined,
      nextReviewAt: nextReviewAt.trim() || undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextStatus =
      status === 'approved' && !canApprove ? 'draft' : status;
    onSave(buildPayload(nextStatus));
  }

  function handleSaveApproved() {
    onSave(buildPayload('approved'));
  }

  if (step === 'template') {
    return (
      <div className="ebc-card space-y-4">
        <div>
          <h4 className="font-bold text-ebc-burgundy">Choose a starting template</h4>
          <p className="mt-1 text-sm text-slate-600">
            Use <strong>Ministry charter (CLC)</strong> for the ministry operating manual, or a
            task template for a recurring checklist. Templates are set under Leadership → SOP
            templates.
          </p>
        </div>

        {templates.length === 0 ? (
          <p className="text-sm text-slate-500">
            No templates are enabled for this ministry category. Ask leadership to add one
            under Leadership → SOP templates.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => selectTemplate(template.id)}
                className="rounded-lg border-2 border-slate-200 p-4 text-left transition-colors hover:border-ebc-burgundy hover:bg-ebc-burgundy/5"
              >
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{template.label}</p>
                  {template.kind === 'charter' ? (
                    <span className="rounded-full bg-ebc-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ebc-navy">
                      Charter
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{template.description}</p>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-slate-200 p-0.5">
          <button
            type="button"
            onClick={() => {
              if (mode === 'advanced') {
                setDraft(
                  parseSopContent(
                    rawContent,
                    draft.title,
                    sopConfig.sections,
                    draft.templateId,
                  ),
                );
              }
              setMode('guided');
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === 'guided' ? 'bg-ebc-burgundy text-white' : 'text-slate-600'}`}
          >
            Guided
          </button>
          <button
            type="button"
            onClick={() => {
              setRawContent(composeSopContent(draft, sopConfig.sections));
              setMode('advanced');
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === 'advanced' ? 'bg-ebc-burgundy text-white' : 'text-slate-600'}`}
          >
            Advanced
          </button>
        </div>
        {isNew ? (
          <button
            type="button"
            onClick={() => setStep('template')}
            className="text-sm font-medium text-ebc-navy hover:underline"
          >
            Change template
          </button>
        ) : null}
      </div>

      {isCharter ? (
        <p className="rounded-lg border border-ebc-navy/20 bg-ebc-navy/5 px-3 py-2 text-sm text-ebc-navy">
          CLC ministry charter — includes scope, structure, membership, and meetings. Task
          checklists use a lighter section set.
        </p>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">SOP title *</span>
        <input
          required
          value={draft.title}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          placeholder={
            isCharter
              ? `e.g. ${ministry.name} operating charter`
              : 'e.g. Belmont Bay nursing home visit'
          }
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="ebc-card space-y-3">
        <h4 className="text-sm font-bold text-ebc-burgundy">Document control (CLC)</h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Document #</span>
            <input
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Version</span>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Effective date</span>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Prepared by</span>
            <input
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="Ministry leader"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Reviewed by</span>
            <input
              value={reviewedBy}
              onChange={(e) => setReviewedBy(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Next review</span>
            <input
              type="date"
              value={nextReviewAt}
              onChange={(e) => setNextReviewAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MinistrySopStatus)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="in_review">In review</option>
              {canApprove ? <option value="approved">Approved</option> : null}
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        {!canApprove ? (
          <p className="text-xs text-slate-500">
            Pastor or administrators approve SOPs. You can save as draft or in review.
          </p>
        ) : null}
      </div>

      {mode === 'guided' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {visibleSections.map((section) => {
              const value = draft.sections[section.id];
              const isEmpty = !value.trim();

              return (
                <div key={section.id} className="ebc-card">
                  <div className="flex items-start justify-between gap-3">
                    <label htmlFor={section.id} className="font-semibold text-slate-900">
                      {section.label}
                      {section.required ? (
                        <span className="text-ebc-burgundy"> *</span>
                      ) : null}
                      {section.charterOnly ? (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-ebc-navy">
                          CLC
                        </span>
                      ) : null}
                    </label>
                    <SopSectionHelp
                      ministryName={ministry.name}
                      ministryCategory={MINISTRY_CATEGORIES[ministry.category].label}
                      sopTitle={draft.title}
                      templateId={draft.templateId}
                      isCharter={isCharter}
                      section={section}
                      currentValue={value}
                      onApplyDraft={(text) => updateSection(section.id, text)}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ebc-navy">{section.hint}</p>
                  <textarea
                    id={section.id}
                    rows={
                      section.id === 'steps' || section.id === 'structure' ? 6 : 3
                    }
                    value={value}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    placeholder={section.placeholder}
                    className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm leading-relaxed"
                  />
                  {isEmpty && section.required ? (
                    <p className="mt-1 text-xs text-ebc-gold-bright">Required for quality score</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start">
            <SopQualityPanel
              quality={quality}
              minQualityScore={sopConfig.minQualityScore}
            />
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Live preview
              </p>
              <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-600">
                {composeSopContent(draft, sopConfig.sections) || 'Fill sections to see preview…'}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Markdown content</span>
            <textarea
              rows={18}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </label>
          <pre className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-700">
            {rawContent || 'Nothing to preview yet.'}
          </pre>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={isPending || !draft.title.trim()}
          className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white hover:bg-ebc-green-dark disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save SOP'}
        </button>
        {canApprove && status !== 'approved' ? (
          <button
            type="button"
            disabled={isPending || !draft.title.trim() || !quality.readyToPublish}
            onClick={handleSaveApproved}
            className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark disabled:opacity-50"
          >
            Save & approve
          </button>
        ) : null}
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
