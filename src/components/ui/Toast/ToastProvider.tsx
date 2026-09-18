'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import type { ToastInput, ToastItem, ToastTone } from './toast.types';

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-ebc-green/30 bg-white text-slate-900',
  error: 'border-red-200 bg-white text-slate-900',
  info: 'border-ebc-burgundy/25 bg-white text-slate-900',
};

const TONE_ACCENT: Record<ToastTone, string> = {
  success: 'bg-ebc-green',
  error: 'bg-red-600',
  info: 'bg-ebc-burgundy',
};

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        tone: input.tone ?? 'info',
        durationMs: input.durationMs,
      };
      setItems((current) => [...current, item].slice(-4));
      const duration = input.durationMs ?? 4500;
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-stretch gap-2 p-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-96"
        aria-live="polite"
        aria-relevant="additions"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto overflow-hidden rounded-xl border shadow-lg ${TONE_STYLES[item.tone]}`}
            role="status"
          >
            <div className="flex gap-3 p-4">
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${TONE_ACCENT[item.tone]}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="min-h-11 shrink-0 px-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                aria-label="Dismiss"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
