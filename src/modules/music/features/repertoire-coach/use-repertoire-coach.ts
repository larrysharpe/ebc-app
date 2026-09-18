'use client';

import { useCallback, useEffect, useState } from 'react';

import type { CursorStatusResponse } from '@/modules/cursor/types/cursor.types';

import { generateRepertoireCoachAction } from '../../actions/music.actions';

export type UseRepertoireCoachResult = {
  isConfigured: boolean | null;
  isLoading: boolean;
  error: string | null;
  guidance: string;
  generatedAtLabel: string | null;
  requestGuidance: () => Promise<void>;
};

function formatGeneratedAt(iso: string, now: Date = new Date()): string {
  const generatedAt = new Date(iso);
  if (Number.isNaN(generatedAt.getTime())) return 'Unknown time';
  const minutes = Math.floor((now.getTime() - generatedAt.getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return generatedAt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function useRepertoireCoach(options?: {
  canRefresh?: boolean;
}): UseRepertoireCoachResult {
  const canRefresh = options?.canRefresh ?? false;
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidance, setGuidance] = useState('');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

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

  const requestGuidance = useCallback(async () => {
    if (!canRefresh || isLoading) return;
    if (isConfigured === false) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateRepertoireCoachAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setGuidance(result.guidance);
      setGeneratedAt(result.generatedAt);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Repertoire coaching failed.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [canRefresh, isConfigured, isLoading]);

  return {
    isConfigured,
    isLoading,
    error,
    guidance,
    generatedAtLabel: generatedAt ? formatGeneratedAt(generatedAt) : null,
    requestGuidance,
  };
}
