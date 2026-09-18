'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { CursorStatusResponse } from '@/modules/cursor/types/cursor.types';
import { readCursorSseStream } from '@/modules/cursor/utils/read-cursor-sse.utils';

import {
  buildSopSectionHelpPrompt,
  extractSuggestedDraft,
  type SopSectionHelpContext,
} from './sop-section-help.utils';

export type UseSopSectionHelpResult = {
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  response: string;
  suggestedDraft: string | null;
  requestHelp: () => Promise<void>;
  reset: () => void;
};

export function useSopSectionHelp(
  context: SopSectionHelpContext,
): UseSopSectionHelpResult {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const contextRef = useRef(context);
  const loadingRef = useRef(false);

  contextRef.current = context;

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const result = await fetch('/api/cursor/status');
        if (!result.ok) return;
        const data = (await result.json()) as CursorStatusResponse;
        if (!cancelled) setIsConfigured(data.enabled);
      } catch {
        if (!cancelled) setIsConfigured(false);
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setResponse('');
  }, []);

  const requestHelp = useCallback(async () => {
    if (loadingRef.current || !isConfigured) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const prompt = buildSopSectionHelpPrompt(contextRef.current);
      const result = await fetch('/api/cursor/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          purpose: 'sop-section-help',
          pagePath: '/ministries/sops',
          pageTitle: `SOP help · ${contextRef.current.section.label}`,
        }),
      });

      if (!result.ok) {
        const payload = (await result.json()) as { error?: string };
        throw new Error(payload.error ?? 'AI guidance request failed.');
      }

      await readCursorSseStream(result, (event) => {
        if (event.type === 'text') {
          setResponse((current) => current + event.text);
          return;
        }
        if (event.type === 'error') {
          setError(event.message);
          return;
        }
        if (event.type === 'done' && event.status === 'error') {
          setError('AI guidance could not complete.');
        }
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'AI guidance request failed.',
      );
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [isConfigured]);

  return {
    isConfigured,
    isLoading,
    error,
    response,
    suggestedDraft: extractSuggestedDraft(response),
    requestHelp,
    reset,
  };
}
