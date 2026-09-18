const SMS_MAX_LENGTH = 1500;

/**
 * Normalize a US/CA-friendly phone into E.164. Returns null when unusable.
 */
export function normalizePhoneE164(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) return null;
    return `+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

/** Build SMS text: short body + optional absolute app link, truncated for carriers. */
export function buildSmsText(input: {
  body: string;
  href?: string;
  appOrigin?: string;
}): string {
  const parts = [input.body.trim()].filter(Boolean);
  const href = input.href?.trim();
  if (href) {
    const origin = input.appOrigin?.replace(/\/$/, '') ?? '';
    const absolute =
      href.startsWith('http://') || href.startsWith('https://')
        ? href
        : origin
          ? `${origin}${href.startsWith('/') ? href : `/${href}`}`
          : href;
    parts.push(absolute);
  }

  const text = parts.join('\n');
  if (text.length <= SMS_MAX_LENGTH) return text;
  return `${text.slice(0, SMS_MAX_LENGTH - 1)}…`;
}
