export { LegalDocument } from './features/legal-document';
export type {
  LegalDocumentModel,
  LegalDocumentProps,
  LegalDocumentSlug,
  LegalSection,
} from './features/legal-document';
export { LegalLinks } from './features/legal-links';
export type { LegalLinksProps, LegalLinksVariant } from './features/legal-links';
export { LegalPageShell } from './features/legal-page-shell';
export { LEGAL_NAV_LINKS, LEGAL_PATHS } from './constants/legal-routes.constants';
export { getLegalDocument, listLegalDocuments } from './utils/legal-documents.utils';
export { isLegalPublicPath } from './utils/legal-public-path.utils';
