/** Local-dev placeholder domain for directory emails. */
export const SEED_EMAIL_DOMAIN = 'ebenezerbc.org';

function slugPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

/**
 * Build a unique local-dev email for a person missing one.
 * Uses first.last@domain, appending a short id suffix on collision.
 */
export function buildSeedPersonEmail(input: {
  firstName: string;
  lastName: string;
  id: string;
  takenEmails: ReadonlySet<string>;
}): string {
  const first = slugPart(input.firstName) || 'member';
  const last = slugPart(input.lastName) || 'unknown';
  const base = `${first}.${last}@${SEED_EMAIL_DOMAIN}`;
  if (!input.takenEmails.has(base.toLowerCase())) {
    return base;
  }

  const suffix = input.id.replace(/^person-/, '').slice(0, 8).toLowerCase();
  const withId = `${first}.${last}.${suffix}@${SEED_EMAIL_DOMAIN}`;
  if (!input.takenEmails.has(withId.toLowerCase())) {
    return withId;
  }

  return `${first}.${last}.${input.id.toLowerCase().replace(/[^a-z0-9]/g, '')}@${SEED_EMAIL_DOMAIN}`;
}
