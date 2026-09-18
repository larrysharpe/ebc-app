'use client';

import { useEffect, useId, useRef, useState } from 'react';

import type { CursorHistoryEntry } from './cursor-history.types';
import { formatHistoryTime } from './cursor-history.utils';

export type CursorHistoryMenuProps = {
  entries: CursorHistoryEntry[];
  onSelect: (entry: CursorHistoryEntry) => void;
  onClear: () => void;
  disabled?: boolean;
  /** When true, rounds only the right side for a button group with New on the left. */
  grouped?: boolean;
};

function HistoryDetail({
  entry,
  onBack,
  onUsePrompt,
}: {
  entry: CursorHistoryEntry;
  onBack: () => void;
  onUsePrompt: () => void;
}) {
  const responseText = entry.error ?? entry.response ?? entry.responsePreview;

  return (
    <div className="flex max-h-[min(24rem,70vh)] flex-col">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onUsePrompt}
          className="rounded-md bg-ebc-burgundy/10 px-2 py-0.5 text-[10px] font-semibold text-ebc-burgundy hover:bg-ebc-burgundy/15"
        >
          Use prompt
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto px-1 pb-1">
        <section>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ebc-burgundy">Prompt</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {entry.prompt}
          </p>
        </section>

        {responseText ? (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ebc-burgundy">
              {entry.error ? 'Error' : 'Response'}
            </p>
            <p
              className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed ${
                entry.error ? 'text-red-700' : 'text-slate-700'
              }`}
            >
              {responseText}
            </p>
          </section>
        ) : null}

        <section className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600">
          <p>
            <span className="font-medium text-slate-700">When:</span>{' '}
            {formatHistoryTime(entry.createdAt)}
          </p>
          <p>
            <span className="font-medium text-slate-700">Type:</span> {entry.kind}
            {entry.status === 'error' ? ' · failed' : ''}
          </p>
          {entry.pageTitle || entry.pagePath ? (
            <p>
              <span className="font-medium text-slate-700">Page:</span>{' '}
              {entry.pageTitle ?? entry.pagePath}
            </p>
          ) : null}
          {entry.navigateLabel || entry.navigatePath ? (
            <p>
              <span className="font-medium text-slate-700">Navigation:</span>{' '}
              {entry.navigateLabel ?? entry.navigatePath}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function CursorHistoryMenu({
  entries,
  onSelect,
  onClear,
  disabled = false,
  grouped = false,
}: CursorHistoryMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<CursorHistoryEntry | null>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setDetailEntry(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (detailEntry) {
          setDetailEntry(null);
          return;
        }
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [detailEntry, open]);

  function closeMenu(): void {
    setOpen(false);
    setDetailEntry(null);
  }

  const triggerClass = grouped
    ? 'rounded-none rounded-r-lg border-l-0'
    : 'rounded-lg';

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => {
            if (value) setDetailEntry(null);
            return !value;
          });
        }}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={menuId}
        title="Command history"
        className={`inline-flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${triggerClass}`}
      >
        <span className="sr-only">Command history</span>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label="AI command history"
          className="absolute right-0 top-[calc(100%+0.35rem)] z-50 w-80 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
        >
          {detailEntry ? (
            <HistoryDetail
              entry={detailEntry}
              onBack={() => setDetailEntry(null)}
              onUsePrompt={() => {
                onSelect(detailEntry);
                closeMenu();
              }}
            />
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between gap-2 px-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ebc-burgundy">
                  History
                </p>
                {entries.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClear();
                      closeMenu();
                    }}
                    className="text-[10px] font-medium text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              {entries.length === 0 ? (
                <p className="px-2 py-3 text-sm text-slate-500">No commands yet.</p>
              ) : (
                <ul className="max-h-72 space-y-1 overflow-y-auto">
                  {entries.map((entry) => (
                    <li key={entry.id}>
                      <div className="rounded-md px-2 py-1.5 transition hover:bg-slate-50">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            role="option"
                            onClick={() => {
                              onSelect(entry);
                              closeMenu();
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <span className="block truncate text-sm font-medium text-slate-800">
                              {entry.prompt}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailEntry(entry)}
                            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ebc-burgundy hover:bg-ebc-burgundy/10"
                          >
                            Details
                          </button>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {formatHistoryTime(entry.createdAt)}
                          <span className="uppercase tracking-wide text-slate-400">
                            {' '}
                            · {entry.kind}
                          </span>
                          {entry.navigateLabel ? ` · ${entry.navigateLabel}` : ''}
                          {entry.status === 'error' ? ' · error' : ''}
                        </p>
                        {entry.responsePreview ? (
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                            {entry.responsePreview}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
