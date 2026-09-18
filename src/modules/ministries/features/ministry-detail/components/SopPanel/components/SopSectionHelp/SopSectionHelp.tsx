'use client';

import { useId, useState } from 'react';

import { MarkdownContent } from '@/components/ui/MarkdownContent';
import type { SopSectionConfig } from '@/modules/leadership/types';

import { coachingTextWithoutDraft } from './sop-section-help.utils';
import { useSopSectionHelp } from './use-sop-section-help';

export type SopSectionHelpProps = {
  ministryName: string;
  ministryCategory: string;
  sopTitle: string;
  templateId: string;
  isCharter: boolean;
  section: SopSectionConfig;
  currentValue: string;
  onApplyDraft: (draft: string) => void;
};

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
      />
    </svg>
  );
}

export function SopSectionHelp({
  ministryName,
  ministryCategory,
  sopTitle,
  templateId,
  isCharter,
  section,
  currentValue,
  onApplyDraft,
}: SopSectionHelpProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  const {
    isConfigured,
    isLoading,
    error,
    response,
    suggestedDraft,
    requestHelp,
    reset,
  } = useSopSectionHelp({
    ministryName,
    ministryCategory,
    sopTitle,
    templateId,
    isCharter,
    section,
    currentValue,
  });

  function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }

    reset();
    setOpen(true);
    if (isConfigured) {
      void requestHelp();
    }
  }

  const coaching = response ? coachingTextWithoutDraft(response) : '';

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={panelId}
        title={
          isConfigured
            ? `AI help for ${section.label}`
            : 'Add CURSOR_API_KEY to enable AI section help'
        }
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border transition ${
          open
            ? 'border-ebc-burgundy bg-ebc-burgundy text-white'
            : 'border-slate-300 bg-white text-slate-500 hover:border-ebc-burgundy hover:text-ebc-burgundy'
        }`}
      >
        <span className="sr-only">AI help for {section.label}</span>
        <HelpIcon className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute left-0 top-8 z-20 w-[min(100vw-2rem,22rem)] rounded-lg border border-slate-200 bg-white p-3 shadow-lg sm:w-96"
          role="dialog"
          aria-label={`AI guidance for ${section.label}`}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ebc-burgundy">
                AI section guide
              </p>
              <p className="text-sm font-semibold text-slate-900">{section.label}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          {!isConfigured ? (
            <p className="text-sm text-slate-600">
              AI help is off. Add <code className="text-xs">CURSOR_API_KEY</code> to enable
              Cursor guidance for SOP sections.
            </p>
          ) : null}

          {isConfigured && error ? (
            <div className="space-y-2">
              <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-sm text-red-700">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  reset();
                  void requestHelp();
                }}
                className="text-xs font-medium text-ebc-navy hover:underline"
              >
                Try again
              </button>
            </div>
          ) : null}

          {isConfigured && !error && isLoading && !response ? (
            <p className="text-sm text-slate-500">Preparing guidance for this section…</p>
          ) : null}

          {isConfigured && !error && response ? (
            <div className="space-y-3">
              {coaching ? (
                <div className="max-h-48 overflow-y-auto">
                  <MarkdownContent
                    trailing={
                      isLoading ? (
                        <span className="animate-pulse text-slate-400"> ▍</span>
                      ) : null
                    }
                  >
                    {coaching}
                  </MarkdownContent>
                </div>
              ) : isLoading ? (
                <p className="text-sm text-slate-500">Preparing guidance…</p>
              ) : null}

              {suggestedDraft ? (
                <div className="rounded-md border border-ebc-green/30 bg-ebc-green/5 p-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ebc-green-dark">
                    Suggested draft
                  </p>
                  <pre className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700">
                    {suggestedDraft}
                  </pre>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      onApplyDraft(suggestedDraft);
                      setOpen(false);
                    }}
                    className="mt-2 rounded-md bg-ebc-green px-2.5 py-1 text-xs font-semibold text-white hover:bg-ebc-green-dark disabled:opacity-50"
                  >
                    Insert into section
                  </button>
                </div>
              ) : null}

              {!isLoading ? (
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    void requestHelp();
                  }}
                  className="text-xs font-medium text-ebc-navy hover:underline"
                >
                  Refresh guidance
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
