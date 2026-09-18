/** Public MEC events collection on the church WordPress site. */
export const EBENEZERBC_MEC_EVENTS_URL =
  'https://ebenezerbc.org/wp-json/wp/v2/mec-events?per_page=100&_fields=id,slug,title,link,content';

export function ebenezerbcEventIcalUrl(mecId: number): string {
  return `https://ebenezerbc.org/?method=ical&id=${mecId}`;
}

/** How far ahead to materialize recurring occurrences when seeding. */
export const SEED_HORIZON_DAYS = 120;

/**
 * Title → ministry id heuristics for first import.
 * First match wins; unmatched stays church-wide.
 */
export const MINISTRY_TITLE_RULES: readonly {
  pattern: RegExp;
  ministryId: string;
}[] = [
  { pattern: /youth|praise\s*dance/i, ministryId: 'min-youth' },
  { pattern: /sunday\s*school/i, ministryId: 'min-sunday-school' },
  { pattern: /women'?s|friendsgiving/i, ministryId: 'min-womens' },
  {
    pattern: /mountain\s*men|men'?s\s*ministry|rgc\s*men/i,
    ministryId: 'min-mountain-men',
  },
  {
    pattern: /nursing\s*home|food\s*pantry|missionary|tithing\s*foundation/i,
    ministryId: 'min-missionary',
  },
  {
    pattern: /bible\s*study|refresh\s*wednesday/i,
    ministryId: 'min-bible-study',
  },
  { pattern: /usher/i, ministryId: 'min-usher' },
  { pattern: /golden\s*eagle|senior\s*citizen/i, ministryId: 'min-golden-eagles' },
  { pattern: /\bjamm\b/i, ministryId: 'min-jamm' },
  { pattern: /deaconess/i, ministryId: 'min-deaconess' },
  { pattern: /deacon/i, ministryId: 'min-deacon' },
  { pattern: /media\s*ministry/i, ministryId: 'min-media' },
  { pattern: /count\s*me\s*in/i, ministryId: 'min-count-me-in' },
  { pattern: /nehemiah/i, ministryId: 'min-nehemiah' },
];
