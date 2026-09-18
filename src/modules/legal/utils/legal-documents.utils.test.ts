import { describe, expect, it } from 'vitest';

import {
  getLegalDocument,
  listLegalDocuments,
  legalSectionIds,
  REQUIRED_PRIVACY_SECTION_IDS,
} from './legal-documents.utils';

describe('legal-documents.utils', () => {
  it('lists privacy and terms', () => {
    expect(listLegalDocuments().map((document) => document.slug)).toEqual([
      'privacy',
      'terms',
    ]);
  });

  it('returns a document by slug', () => {
    expect(getLegalDocument('privacy').title).toBe('Privacy policy');
    expect(getLegalDocument('terms').title).toBe('Terms of use');
  });

  it('keeps unique section ids', () => {
    for (const document of listLegalDocuments()) {
      const ids = legalSectionIds(document);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('keeps required privacy disclosures', () => {
    const ids = legalSectionIds(getLegalDocument('privacy'));
    for (const required of REQUIRED_PRIVACY_SECTION_IDS) {
      expect(ids).toContain(required);
    }
  });

  it('says we do not sell information and giving stays in Realm', () => {
    const privacy = getLegalDocument('privacy');
    const text = `${privacy.intro} ${privacy.sections
      .flatMap((section) => [...section.paragraphs, ...(section.bullets ?? [])])
      .join(' ')}`;
    expect(text.toLowerCase()).toContain('will not sell');
    expect(text).toContain('Realm');
    expect(text.toLowerCase()).toContain('under 13');
  });
});
