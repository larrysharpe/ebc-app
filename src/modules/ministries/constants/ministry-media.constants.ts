import type { MinistryFileLibrary, MinistryMediaKind } from '../types';

export const MINISTRY_MEDIA_MAX_BYTES = 50 * 1024 * 1024;
export const MINISTRY_MEDIA_MAX_FILES = 10;

export const MINISTRY_MEDIA_KIND_LABELS: Record<MinistryMediaKind, string> = {
  image: 'Image',
  video: 'Video',
  document: 'Document',
  audio: 'Audio',
  other: 'Other',
};

export const MINISTRY_MEDIA_ACCEPT =
  'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md,.csv,.ppt,.pptx,.xls,.xlsx';

export const MINISTRY_DOCUMENTS_ACCEPT =
  '.pdf,.doc,.docx,.txt,.md,.csv,.rtf,.ppt,.pptx,.xls,.xlsx,application/pdf';

export const MINISTRY_FILE_LIBRARY_COPY: Record<
  MinistryFileLibrary,
  { title: string; description: string; emptyLabel: string; accept: string; showKindFilter: boolean }
> = {
  media: {
    title: 'Media library',
    description: 'Photos, videos, and audio — organize by year and event (e.g. 2026/CLC Retreat).',
    emptyLabel: 'No media yet',
    accept: MINISTRY_MEDIA_ACCEPT,
    showKindFilter: true,
  },
  documents: {
    title: 'Documents',
    description:
      'PDFs, forms, and ministry files — organize by year and topic (e.g. 2026/Handbooks).',
    emptyLabel: 'No documents yet',
    accept: MINISTRY_DOCUMENTS_ACCEPT,
    showKindFilter: false,
  },
};
