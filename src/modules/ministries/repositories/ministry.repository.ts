import { prisma } from '@/lib/db';
import { mergeWebsiteSops } from '../data/website-sops';
import type { Ministry, MinistryEvent, MinistryPerson, MinistrySop } from '../types';
import {
  normalizeDuties,
  normalizeDutyCatalog,
} from '../utils/ministry-personnel.utils';

function mapPersonnel(value: unknown): MinistryPerson[] {
  if (!Array.isArray(value)) return [];
  return value.map((raw) => {
    const person = raw as MinistryPerson;
    return {
      ...person,
      duties: normalizeDuties(person.duties),
    };
  });
}

function mapMinistry(row: {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  websiteUrl: string | null;
  meetingSummary: string | null;
  contactEmail?: string | null;
  personnel: unknown;
  events: unknown;
  sops: unknown;
  dutyCatalog?: unknown;
  suggestedPlan?: string | null;
  suggestedPlanGeneratedAt?: Date | null;
}): Ministry {
  const sops = mergeWebsiteSops(row.sops as MinistrySop[], row.slug);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as Ministry['category'],
    description: row.description,
    websiteUrl: row.websiteUrl ?? undefined,
    meetingSummary: row.meetingSummary ?? undefined,
    contactEmail: row.contactEmail ?? undefined,
    personnel: mapPersonnel(row.personnel),
    events: row.events as MinistryEvent[],
    sops,
    dutyCatalog: normalizeDutyCatalog(row.dutyCatalog),
    suggestedPlan: row.suggestedPlan ?? undefined,
    suggestedPlanGeneratedAt: row.suggestedPlanGeneratedAt
      ? row.suggestedPlanGeneratedAt.toISOString()
      : undefined,
  };
}

export async function listMinistries(): Promise<Ministry[]> {
  const rows = await prisma.ministry.findMany({ orderBy: { name: 'asc' } });
  return rows.map(mapMinistry);
}

export async function getMinistryById(id: string): Promise<Ministry | null> {
  const row = await prisma.ministry.findUnique({ where: { id } });
  return row ? mapMinistry(row) : null;
}

export async function getMinistryBySlug(slug: string): Promise<Ministry | null> {
  const row = await prisma.ministry.findUnique({ where: { slug } });
  if (!row) return null;

  const ministry = mapMinistry(row);

  // Stale Prisma clients can omit newer Json columns; recover from SQL if needed.
  if (ministry.dutyCatalog.length === 0) {
    const raw = await prisma.$queryRaw<Array<{ dutyCatalog: unknown }>>`
      SELECT "dutyCatalog" FROM "Ministry" WHERE "slug" = ${slug} LIMIT 1
    `;
    const fromDb = normalizeDutyCatalog(raw[0]?.dutyCatalog);
    if (fromDb.length > 0) {
      return { ...ministry, dutyCatalog: fromDb };
    }
  }

  return ministry;
}

export async function updateMinistry(
  updated: Ministry,
  options?: { replaceDutyCatalog?: boolean },
): Promise<Ministry> {
  let dutyCatalog = updated.dutyCatalog;

  // Guard against stale Prisma reads that omit dutyCatalog and would wipe it on save.
  // Duty catalog mutations pass replaceDutyCatalog so an intentional empty list is kept.
  if (dutyCatalog.length === 0 && !options?.replaceDutyCatalog) {
    const raw = await prisma.$queryRaw<Array<{ dutyCatalog: unknown }>>`
      SELECT "dutyCatalog" FROM "Ministry" WHERE "id" = ${updated.id} LIMIT 1
    `;
    const existing = normalizeDutyCatalog(raw[0]?.dutyCatalog);
    if (existing.length > 0) {
      dutyCatalog = existing;
    }
  }

  const row = await prisma.ministry.update({
    where: { id: updated.id },
    data: {
      slug: updated.slug,
      name: updated.name,
      category: updated.category,
      description: updated.description,
      websiteUrl: updated.websiteUrl,
      meetingSummary: updated.meetingSummary,
      contactEmail: updated.contactEmail,
      personnel: updated.personnel,
      events: updated.events,
      sops: updated.sops,
      dutyCatalog,
    },
  });
  return mapMinistry(row);
}

export async function updateMinistrySuggestedPlan(
  ministryId: string,
  suggestedPlan: string,
  generatedAt: Date = new Date(),
): Promise<void> {
  await prisma.ministry.update({
    where: { id: ministryId },
    data: {
      suggestedPlan,
      suggestedPlanGeneratedAt: generatedAt,
    },
  });
}
