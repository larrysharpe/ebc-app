'use client';

import { useState, type ReactElement, type ReactNode } from 'react';

export type CollapsibleHomeSectionProps = {
  id: string;
  label: string;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleHomeSection({
  id,
  label,
  title,
  count,
  defaultOpen = true,
  children,
}: CollapsibleHomeSectionProps): ReactElement {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="ebc-card overflow-hidden p-0 sm:p-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-4 text-left hover:bg-slate-50 sm:px-5"
      >
        <div className="min-w-0 flex-1">
          <p className="ebc-section-label">{label}</p>
          <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">
            {title}
            {typeof count === 'number' ? (
              <span className="ml-2 text-base font-semibold text-slate-500">
                ({count})
              </span>
            ) : null}
          </h2>
        </div>
        <svg
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div id={id} className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
