'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { CursorStatusResponse, CursorStreamEvent } from '@/modules/cursor/types/cursor.types';
import { readCursorSseStream } from '@/modules/cursor/utils/read-cursor-sse.utils';

import type { AppAction } from '../app-control/app-control.types';
import {
  extractAppActionsFromText,
  parseAppControlIntent,
  stripAppActionBlock,
} from '../app-control/app-control.utils';
import type { CursorHistoryEntry } from './cursor-history.types';
import {
  appendCursorHistory,
  createHistoryId,
  loadCursorHistory,
  previewResponse,
  saveCursorHistory,
} from './cursor-history.utils';

const AGENT_ASK_KEY = 'ebc-cursor-agent-ask';
const AGENT_WRITE_KEY = 'ebc-cursor-agent-write';

export type CursorAttachment = {
  id: string;
  file: File;
};

export type UseCursorPromptOptions = {
  pagePath?: string;
  pageTitle?: string;
  initialStatus?: Pick<CursorStatusResponse, 'enabled' | 'runtime' | 'canWrite'>;
  /** Execute allowlisted in-app actions (navigate, etc.). */
  executeAction?: (action: AppAction) => boolean;
};

export type UseCursorPromptResult = {
  prompt: string;
  setPrompt: (value: string) => void;
  attachments: CursorAttachment[];
  addAttachments: (files: FileList | File[]) => void;
  removeAttachment: (id: string) => void;
  response: string;
  tools: Array<{ name: string; status: string }>;
  isLoading: boolean;
  isConfigured: boolean;
  canWrite: boolean;
  runtime: CursorStatusResponse['runtime'];
  error: string | null;
  panelOpen: boolean;
  history: CursorHistoryEntry[];
  submit: (promptOverride?: string) => Promise<void>;
  clearConversation: () => void;
  clearHistory: () => void;
  restoreFromHistory: (entry: CursorHistoryEntry) => void;
  dismissPanel: () => void;
};

export function useCursorPrompt({
  pagePath,
  pageTitle,
  initialStatus,
  executeAction,
}: UseCursorPromptOptions): UseCursorPromptResult {
  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState<CursorAttachment[]>([]);
  const [response, setResponse] = useState('');
  const [tools, setTools] = useState<Array<{ name: string; status: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(Boolean(initialStatus?.enabled));
  const [canWrite, setCanWrite] = useState(Boolean(initialStatus?.canWrite));
  const [runtime, setRuntime] = useState<CursorStatusResponse['runtime']>(
    initialStatus?.runtime ?? 'unconfigured',
  );
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [history, setHistory] = useState<CursorHistoryEntry[]>([]);
  const agentIdRef = useRef<string | undefined>(undefined);
  const canWriteRef = useRef(Boolean(initialStatus?.canWrite));

  useEffect(() => {
    canWriteRef.current = canWrite;
  }, [canWrite]);

  useEffect(() => {
    setHistory(loadCursorHistory());
  }, []);

  const recordHistory = useCallback((entry: Omit<CursorHistoryEntry, 'id' | 'createdAt'>) => {
    const nextEntry: CursorHistoryEntry = {
      ...entry,
      id: createHistoryId(),
      createdAt: new Date().toISOString(),
    };
    setHistory((current) => {
      const next = appendCursorHistory(current, nextEntry);
      saveCursorHistory(next);
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function applyStatus(data: CursorStatusResponse): Promise<void> {
      if (cancelled) return;
      setIsConfigured(data.enabled);
      setRuntime(data.runtime);
      setCanWrite(Boolean(data.canWrite));
      canWriteRef.current = Boolean(data.canWrite);

      const storageKey = data.canWrite ? AGENT_WRITE_KEY : AGENT_ASK_KEY;
      const storedAgentId = sessionStorage.getItem(storageKey);
      agentIdRef.current = storedAgentId || undefined;
    }

    async function loadStatus(attempt = 0): Promise<void> {
      try {
        const result = await fetch('/api/cursor/status', { cache: 'no-store' });
        if (!result.ok) {
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
            return loadStatus(attempt + 1);
          }
          return;
        }

        const data = (await result.json()) as CursorStatusResponse;
        await applyStatus(data);
      } catch {
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
          return loadStatus(attempt + 1);
        }
      }
    }

    if (typeof window !== 'undefined') {
      const storageKey = initialStatus?.canWrite ? AGENT_WRITE_KEY : AGENT_ASK_KEY;
      const storedAgentId = sessionStorage.getItem(storageKey);
      agentIdRef.current = storedAgentId || undefined;
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [initialStatus?.canWrite]);

  const addAttachments = useCallback((files: FileList | File[]) => {
    const next = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
    }));
    setAttachments((current) => [...current, ...next].slice(0, 5));
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }, []);

  const submit = useCallback(async (promptOverride?: string) => {
    const trimmed = (promptOverride ?? prompt).trim();
    if (!trimmed || isLoading) return;

    const localIntent = parseAppControlIntent(trimmed);
    if (localIntent && executeAction?.(localIntent.action)) {
      setError(null);
      setTools([]);
      setResponse(`Opening ${localIntent.action.label}…`);
      setPanelOpen(true);
      recordHistory({
        prompt: trimmed,
        kind: 'navigate',
        pagePath,
        pageTitle,
        navigatePath: localIntent.action.path,
        navigateLabel: localIntent.action.label,
        response: `Opening ${localIntent.action.label}…`,
        responsePreview: `Opening ${localIntent.action.label}`,
        status: 'ok',
        canWrite,
      });
      return;
    }

    if (!isConfigured) return;

    setIsLoading(true);
    setError(null);
    setResponse('');
    setTools([]);
    setPanelOpen(true);

    let streamError: string | null = null;

    try {
      const formData = new FormData();
      formData.set('prompt', trimmed);
      formData.set('purpose', 'general');
      if (agentIdRef.current) formData.set('agentId', agentIdRef.current);
      if (pagePath) formData.set('pagePath', pagePath);
      if (pageTitle) formData.set('pageTitle', pageTitle);
      for (const attachment of attachments) {
        formData.append('files', attachment.file, attachment.file.name);
      }

      const result = await fetch('/api/cursor/prompt', {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) {
        const payload = (await result.json()) as { error?: string };
        throw new Error(payload.error ?? 'Cursor request failed.');
      }

      let fullText = '';

      await readCursorSseStream(result, (event: CursorStreamEvent) => {
        if (event.type === 'agent') {
          agentIdRef.current = event.agentId;
          const storageKey = canWriteRef.current ? AGENT_WRITE_KEY : AGENT_ASK_KEY;
          sessionStorage.setItem(storageKey, event.agentId);
          return;
        }

        if (event.type === 'text') {
          fullText += event.text;
          setResponse(stripAppActionBlock(fullText) || fullText);
          return;
        }

        if (event.type === 'tool') {
          setTools((current) => {
            const existing = current.findIndex(
              (tool) => tool.name === event.name && tool.status === 'running',
            );
            if (existing >= 0) {
              const copy = [...current];
              copy[existing] = { name: event.name, status: event.status };
              return copy;
            }
            return [...current, { name: event.name, status: event.status }];
          });
          return;
        }

        if (event.type === 'error') {
          streamError = event.message;
          setError(event.message);
          return;
        }

        if (event.type === 'done' && event.status === 'error') {
          streamError = 'Cursor could not complete that request.';
          setError(streamError);
        }
      });

      const actions = extractAppActionsFromText(fullText);
      for (const action of actions) {
        executeAction?.(action);
      }
      if (actions.length > 0) {
        setResponse((current) => {
          const cleaned = stripAppActionBlock(fullText);
          if (cleaned) return cleaned;
          return current || `Opening ${actions[0]?.label ?? 'page'}…`;
        });
      }

      const cleaned = stripAppActionBlock(fullText) || fullText;
      recordHistory({
        prompt: trimmed,
        kind: actions.length > 0 ? 'navigate' : 'ask',
        pagePath,
        pageTitle,
        navigatePath: actions[0]?.path,
        navigateLabel: actions[0]?.label,
        response: cleaned || undefined,
        responsePreview: previewResponse(cleaned),
        status: streamError ? 'error' : 'ok',
        error: streamError ?? undefined,
        canWrite,
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Cursor request failed.';
      setError(message);
      recordHistory({
        prompt: trimmed,
        kind: 'ask',
        pagePath,
        pageTitle,
        status: 'error',
        error: message,
        canWrite,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    attachments,
    canWrite,
    executeAction,
    isConfigured,
    isLoading,
    pagePath,
    pageTitle,
    prompt,
    recordHistory,
  ]);

  const clearConversation = useCallback(() => {
    agentIdRef.current = undefined;
    sessionStorage.removeItem(AGENT_ASK_KEY);
    sessionStorage.removeItem(AGENT_WRITE_KEY);
    setResponse('');
    setTools([]);
    setError(null);
    setAttachments([]);
    setPanelOpen(false);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveCursorHistory([]);
  }, []);

  const restoreFromHistory = useCallback((entry: CursorHistoryEntry) => {
    setPrompt(entry.prompt);
    setError(null);
  }, []);

  const dismissPanel = useCallback(() => {
    if (!isLoading) {
      setPanelOpen(false);
    }
  }, [isLoading]);

  return {
    prompt,
    setPrompt,
    attachments,
    addAttachments,
    removeAttachment,
    response,
    tools,
    isLoading,
    isConfigured,
    canWrite,
    runtime,
    error,
    panelOpen,
    history,
    submit,
    clearConversation,
    clearHistory,
    restoreFromHistory,
    dismissPanel,
  };
}
