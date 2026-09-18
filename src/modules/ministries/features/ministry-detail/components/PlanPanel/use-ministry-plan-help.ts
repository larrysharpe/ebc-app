'use client';

import { useCallback, useEffect, useState } from 'react';

import type { CursorStatusResponse } from '@/modules/cursor/types/cursor.types';
import { refreshMinistrySuggestedPlanAction } from '@/modules/ministries/actions/ministry.actions';
import type { Ministry } from '@/modules/ministries/types';
import { formatSuggestedPlanGeneratedAt } from '@/modules/ministries/utils/ministry-suggested-plan.utils';

export type UseMinistryPlanHelpResult = {
  isConfigured: boolean | null;
  isLoading: boolean;
  error: string | null;
  response: string;
  generatedAtLabel: string | null;
  requestPlan: () => Promise<void>;
};

export function useMinistryPlanHelp(
  ministry: Ministry,
  options?: { canRefresh?: boolean },
): UseMinistryPlanHelpResult {
  const canRefresh = options?.canRefresh ?? false;
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState(ministry.suggestedPlan ?? '');
  const [generatedAt, setGeneratedAt] = useState<string | null>(
    ministry.suggestedPlanGeneratedAt ?? null,
  );

  useEffect(() => {
    setResponse(ministry.suggestedPlan ?? '');
    setGeneratedAt(ministry.suggestedPlanGeneratedAt ?? null);
    setError(null);
  }, [ministry.slug, ministry.suggestedPlan, ministry.suggestedPlanGeneratedAt]);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const result = await fetch('/api/cursor/status');
        if (!result.ok) {
          if (!cancelled) setIsConfigured(false);
          return;
        }
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

  const requestPlan = useCallback(async () => {
    if (!canRefresh || isLoading) return;
    if (isConfigured === false) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await refreshMinistrySuggestedPlanAction(ministry.slug);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setResponse(result.suggestedPlan);
      setGeneratedAt(result.generatedAt);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Suggested plan refresh failed.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [canRefresh, isConfigured, isLoading, ministry.slug]);

  const generatedAtLabel = generatedAt
    ? formatSuggestedPlanGeneratedAt(generatedAt)
    : null;

  return {
    isConfigured,
    isLoading,
    error,
    response,
    generatedAtLabel,
    requestPlan,
  };
}
