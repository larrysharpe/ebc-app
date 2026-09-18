export type CursorHistoryKind = 'navigate' | 'ask';

export type CursorHistoryEntry = {
  id: string;
  prompt: string;
  kind: CursorHistoryKind;
  createdAt: string;
  pagePath?: string;
  pageTitle?: string;
  navigatePath?: string;
  navigateLabel?: string;
  /** Full assistant response when available. */
  response?: string;
  responsePreview?: string;
  status: 'ok' | 'error';
  error?: string;
  /** Whether the user had webmaster write mode when the command ran. */
  canWrite: boolean;
};
