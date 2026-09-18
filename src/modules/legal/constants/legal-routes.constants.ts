import type { LegalDocumentSlug } from '@/modules/legal/features/legal-document/legal-document.types';

export const LEGAL_HUB_PATH = '/legal' as const;

export const LEGAL_PATHS = {
  hub: LEGAL_HUB_PATH,
  privacy: `${LEGAL_HUB_PATH}/privacy`,
  terms: `${LEGAL_HUB_PATH}/terms`,
} as const;

export const LEGAL_NAV_LINKS: ReadonlyArray<{
  href: (typeof LEGAL_PATHS)[keyof typeof LEGAL_PATHS];
  label: string;
  slug?: LegalDocumentSlug;
}> = [
  { href: LEGAL_PATHS.privacy, label: 'Privacy policy', slug: 'privacy' },
  { href: LEGAL_PATHS.terms, label: 'Terms of use', slug: 'terms' },
];

export const LEGAL_PRIVACY_CONTACT_EMAIL = 'churchadmin@ebenezerbc.org';
export const LEGAL_PRAYER_EMAIL = 'prayerrequests@ebenezerbc.org';
export const LEGAL_GIVING_EMAIL = 'onlinegiving@ebenezerbc.org';
