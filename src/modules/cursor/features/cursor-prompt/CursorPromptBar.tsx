'use client';

import { useRef } from 'react';

import type { CursorStatusResponse } from '@/modules/cursor/types/cursor.types';

import { useAppControl } from '../app-control';
import { CursorHistoryMenu } from './CursorHistoryMenu';
import { voiceStatusMessage } from './cursor-voice-input.utils';
import { useCursorPrompt } from './use-cursor-prompt';
import { useCursorVoiceInput } from './use-cursor-voice-input';

export type CursorPromptBarProps = {
  pagePath?: string;
  pageTitle?: string;
  initialStatus?: Pick<CursorStatusResponse, 'enabled' | 'runtime' | 'canWrite'>;
};

export function CursorPromptBar({
  pagePath,
  pageTitle,
  initialStatus,
}: CursorPromptBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { executeAction } = useAppControl();
  const {
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
  } = useCursorPrompt({ pagePath, pageTitle, initialStatus, executeAction });

  const placeholder = !isConfigured
    ? 'Open a page (e.g. open media ministry SOPs) — add CURSOR_API_KEY for Ask'
    : canWrite
      ? 'Ask or control the app — e.g. open media ministry SOPs…'
      : 'Ask or open a page — e.g. go to Golden Eagles…';

  const looksLikeNav = /^(open|go to|goto|show|take me to|navigate to|bring up|pull up)\b/i.test(
    prompt.trim(),
  );

  const {
    status: voiceStatus,
    isListening,
    isSupported: voiceSupported,
    error: voiceError,
    toggleListening,
  } = useCursorVoiceInput({
    prompt,
    setPrompt,
    onSubmit: (spokenPrompt) => {
      void submit(spokenPrompt);
    },
    onClearPrompt: () => setPrompt(''),
    onNewConversation: isConfigured ? clearConversation : undefined,
    disabled: isLoading,
  });

  const voiceHint = voiceStatusMessage(voiceStatus, voiceError);

  return (
    <div className="relative w-full min-w-0 max-w-xl">
      <form
        className="flex min-w-0 items-center gap-1.5 sm:gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label htmlFor="cursor-prompt" className="sr-only">
          Ask Cursor
        </label>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.mp4,.webm,.mov,.pdf,.txt,.md,.csv,.json,.doc,.docx"
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) {
              addAttachments(event.target.files);
              event.target.value = '';
            }
          }}
        />

        <div className="relative min-w-0 flex-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ebc-burgundy/70"
            aria-hidden
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.455 2.456Z"
              />
            </svg>
          </span>

          <input
            id="cursor-prompt"
            type="text"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={isListening ? 'Listening… say your command' : placeholder}
            disabled={isLoading}
            title={
              isConfigured && runtime !== 'unconfigured'
                ? canWrite
                  ? `Cursor ${runtime} · webmaster write mode + app control`
                  : `Cursor ${runtime} · ask + app control`
                : 'App control works without a key; Ask Cursor needs CURSOR_API_KEY'
            }
            className={`h-10 w-full rounded-lg border bg-slate-50 pl-9 pr-[4.5rem] text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-ebc-burgundy/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
              isListening
                ? 'border-ebc-burgundy ring-2 ring-ebc-burgundy/20'
                : 'border-slate-200 focus:border-ebc-burgundy'
            }`}
          />

          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isConfigured || isLoading}
              title="Attach files or images"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-ebc-burgundy disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="sr-only">Attach files</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading || !voiceSupported}
              title={
                !voiceSupported
                  ? 'Voice input not supported in this browser'
                  : isListening
                    ? 'Stop listening'
                    : 'Speak a command (say "submit" or "ask" to send)'
              }
              aria-pressed={isListening}
              className={`relative inline-flex h-7 w-7 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isListening
                  ? 'bg-ebc-burgundy text-white hover:bg-ebc-burgundy-dark'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-ebc-burgundy'
              }`}
            >
              <span className="sr-only">{isListening ? 'Stop voice input' : 'Start voice input'}</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-4.5a6 6 0 1 0-12 0V12.75a6 6 0 0 0 6 6Z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v2.25" />
              </svg>
              {isListening ? (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-ebc-gold" />
              ) : null}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim() || (!isConfigured && !looksLikeNav)}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-ebc-burgundy px-2.5 text-sm font-semibold text-white transition hover:bg-ebc-burgundy-dark disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
        >
          {isLoading ? '…' : looksLikeNav && !isConfigured ? 'Go' : 'Ask'}
        </button>

        <div className="hidden shrink-0 items-stretch sm:inline-flex">
          {isConfigured ? (
            <button
              type="button"
              onClick={clearConversation}
              disabled={isLoading}
              className="hidden h-10 shrink-0 items-center justify-center rounded-l-lg border border-r-0 border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 xl:inline-flex"
            >
              New
            </button>
          ) : null}

          <CursorHistoryMenu
            entries={history}
            onSelect={restoreFromHistory}
            onClear={clearHistory}
            disabled={isLoading}
            grouped={isConfigured}
          />
        </div>
      </form>

      {attachments.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {attachments.map((attachment) => (
            <span
              key={attachment.id}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600"
            >
              <span className="truncate">{attachment.file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="font-semibold text-slate-400 hover:text-slate-700"
                aria-label={`Remove ${attachment.file.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {voiceHint ? (
        <p className="mt-1 text-[10px] text-slate-500">{voiceHint}</p>
      ) : isListening ? (
        <p className="mt-1 text-[10px] text-ebc-burgundy">
          Listening… say &quot;submit&quot;, &quot;ask&quot;, or &quot;go&quot; to send · &quot;stop&quot; to cancel
        </p>
      ) : null}

      {panelOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ebc-burgundy">
              Cursor {canWrite ? '· write' : '· ask'}
            </p>
            <button
              type="button"
              onClick={dismissPanel}
              disabled={isLoading}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              Hide
            </button>
          </div>

          {tools.length > 0 ? (
            <ul className="mb-2 max-h-24 space-y-1 overflow-y-auto rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600">
              {tools.map((tool, index) => (
                <li key={`${tool.name}-${index}`}>
                  <span className="font-medium">{tool.name}</span>
                  <span className="text-slate-400"> · {tool.status}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {response ? (
            <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700">
              {response}
              {isLoading ? <span className="animate-pulse text-slate-400"> ▍</span> : null}
            </div>
          ) : isLoading ? (
            <p className="text-sm text-slate-500">Working on your question…</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
