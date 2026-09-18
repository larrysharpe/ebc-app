import 'server-only';

import { prisma } from '@/lib/db';

import { normalizePhoneE164 } from '../utils/sms.utils';

/**
 * Resolve directory phones for user emails (case-insensitive Person.email match).
 * Returns email (lowercased) → E.164 phone.
 */
export async function findPhonesByEmails(
  emails: readonly string[],
): Promise<Map<string, string>> {
  const normalized = [
    ...new Set(
      emails
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0),
    ),
  ];
  if (normalized.length === 0) return new Map();

  const people = await prisma.person.findMany({
    where: {
      OR: normalized.map((email) => ({
        email: { equals: email, mode: 'insensitive' as const },
      })),
    },
    select: { email: true, phone: true },
  });

  const map = new Map<string, string>();
  for (const person of people) {
    const email = person.email?.trim().toLowerCase();
    if (!email) continue;
    const phone = normalizePhoneE164(person.phone);
    if (!phone) continue;
    if (!map.has(email)) map.set(email, phone);
  }
  return map;
}
