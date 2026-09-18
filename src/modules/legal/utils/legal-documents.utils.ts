import { LEGAL_DOCUMENTS } from '@/modules/legal/constants/legal-documents.constants';
import type {
  LegalDocument,
  LegalDocumentSlug,
} from '@/modules/legal/features/legal-document/legal-document.types';

export function listLegalDocuments(): readonly LegalDocument[] {
  return LEGAL_DOCUMENTS;
}

export function getLegalDocument(slug: LegalDocumentSlug): LegalDocument {
  const document = LEGAL_DOCUMENTS.find((item) => item.slug === slug);
  if (!document) {
    throw new Error(`Unknown legal document: ${slug}`);
  }
  return document;
}

export function legalSectionIds(document: LegalDocument): string[] {
  return document.sections.map((section) => section.id);
}

/** Topics the privacy page must keep so the public disclosure stays complete. */
export const REQUIRED_PRIVACY_SECTION_IDS = [
  'what-we-collect',
  'what-we-do-not-collect',
  'who-can-see',
  'children',
  'prayer',
  'giving',
  'third-parties',
  'no-sale',
  'your-choices',
  'safety',
] as const;
