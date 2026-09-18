import type { CursorHistoryEntry } from './cursor-history.types';

export const CURSOR_HISTORY_STORAGE_KEY = 'ebc-cursor-command-history';
export const CURSOR_HISTORY_MAX = 50;

export function createHistoryId(): string {
  return `hist-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

export function previewResponse(text: string, max = 160): string | undefined {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

export function loadCursorHistory(): CursorHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CURSOR_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, CURSOR_HISTORY_MAX);
  } catch {
    return [];
  }
}

export function saveCursorHistory(entries: CursorHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    CURSOR_HISTORY_STORAGE_KEY,
    JSON.stringify(entries.slice(0, CURSOR_HISTORY_MAX)),
  );
}

export function appendCursorHistory(
  existing: CursorHistoryEntry[],
  entry: CursorHistoryEntry,
): CursorHistoryEntry[] {
  const next = [entry, ...existing.filter((item) => item.prompt !== entry.prompt || item.kind !== entry.kind)];
  return next.slice(0, CURSOR_HISTORY_MAX);
}

function isHistoryEntry(value: unknown): value is CursorHistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.prompt === 'string' &&
    (record.kind === 'navigate' || record.kind === 'ask') &&
    typeof record.createdAt === 'string' &&
    (record.status === 'ok' || record.status === 'error') &&
    typeof record.canWrite === 'boolean'
  );
}

export function formatHistoryTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
