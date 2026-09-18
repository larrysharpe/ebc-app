'use client';

import { useEffect, useId, useState, type ReactElement } from 'react';

import { searchPlacesAction } from '@/modules/events/actions/place-search.actions';
import type { PlaceSearchResult } from '@/modules/events/types/place-search.types';

export type EventPlaceSearchProps = {
  value: string;
  onChange: (location: string) => void;
  disabled?: boolean;
  label?: string;
};

export function EventPlaceSearch({
  value,
  onChange,
  disabled = false,
  label = 'Search for a place',
}: EventPlaceSearchProps): ReactElement {
  const listId = useId();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void searchPlacesAction({ query: trimmed }).then((response) => {
        if (cancelled) return;
        setLoading(false);
        if (!response.ok) {
          setError(response.error);
          setResults([]);
          return;
        }
        setError(null);
        setResults(response.results);
        setOpen(true);
      });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  function pick(result: PlaceSearchResult): void {
    onChange(result.label);
    setQuery(result.label);
    setResults([]);
    setOpen(false);
  }

  return (
    <div className="relative space-y-2">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <input
          type="search"
          value={query}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder='Try “Popeyes” or an address…'
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            onChange(next);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base"
        />
      </label>
      <p className="text-xs text-slate-500">
        Suggestions near Woodbridge — pick one, or type your own.
      </p>
      {loading ? (
        <p className="text-xs text-slate-500">Searching…</p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      ) : null}
      {open && results.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {results.map((result) => (
            <li key={result.id} role="option">
              <button
                type="button"
                className="ebc-choice flex w-full flex-col items-start gap-0.5 rounded-none border-0 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(result)}
              >
                <span className="text-sm font-medium text-slate-900">{result.name}</span>
                {result.secondary ? (
                  <span className="text-xs text-slate-600">{result.secondary}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
