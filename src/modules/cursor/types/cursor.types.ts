export type CursorPromptPurpose =
  | 'general'
  | 'sop-section-help'
  | 'ministry-plan-help'
  | 'church-plan-help'
  | 'repertoire-coach-help'
  | 'set-list-suggest-help'
  | 'event-time-suggest-help'
  | 'activity-request-review-help';

export type CursorImageAttachment = {
  data: string;
  mimeType: string;
  fileName?: string;
};

export type CursorFileAttachment = {
  absolutePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type CursorPromptRequest = {
  prompt: string;
  agentId?: string;
  pagePath?: string;
  pageTitle?: string;
  purpose?: CursorPromptPurpose;
  /** Server-enforced: only true when the session user has webmaster. */
  allowWrites: boolean;
  images?: CursorImageAttachment[];
  files?: CursorFileAttachment[];
};

export type CursorStreamEvent =
  | { type: 'agent'; agentId: string }
  | { type: 'text'; text: string }
  | { type: 'tool'; name: string; status: 'running' | 'completed' | 'error' }
  | { type: 'done'; status: string }
  | { type: 'error'; message: string; retryable?: boolean };

export type CursorStatusResponse = {
  enabled: boolean;
  runtime: 'local' | 'cloud' | 'unconfigured';
  canWrite: boolean;
  authenticated: boolean;
};
