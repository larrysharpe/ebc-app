import { describe, expect, it } from 'vitest';

import { updateMinistryMetadataSchema } from './ministry-metadata.schemas';

describe('updateMinistryMetadataSchema', () => {
  it('accepts a valid ministry metadata payload', () => {
    const result = updateMinistryMetadataSchema.safeParse({
      name: 'Golden Eagles',
      category: 'fellowship',
      description: 'Fellowship, prayer, and lunch for seniors.',
      meetingSummary: 'Wed noon prayer + lunch',
      websiteUrl: 'https://ebenezerbc.org/connect/fellowship-ministries/senior-citizen-ministry',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Golden Eagles');
      expect(result.data.meetingSummary).toBe('Wed noon prayer + lunch');
    }
  });

  it('clears blank optional fields', () => {
    const result = updateMinistryMetadataSchema.safeParse({
      name: 'Youth Ministry',
      category: 'fellowship',
      description: 'Youth gatherings under 19.',
      meetingSummary: '  ',
      contactEmail: '',
      websiteUrl: '',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.meetingSummary).toBeUndefined();
      expect(result.data.contactEmail).toBeUndefined();
      expect(result.data.websiteUrl).toBeUndefined();
    }
  });

  it('rejects an empty name', () => {
    const result = updateMinistryMetadataSchema.safeParse({
      name: '   ',
      category: 'fellowship',
      description: 'Valid description',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid website URL', () => {
    const result = updateMinistryMetadataSchema.safeParse({
      name: 'Media Ministry',
      category: 'service',
      description: 'AV and livestream support.',
      websiteUrl: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });
});
