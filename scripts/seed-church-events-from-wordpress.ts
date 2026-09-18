/**
 * Pull Modern Events Calendar items from ebenezerbc.org and upsert:
 * - ChurchEvent rows for real calendar events
 * - SundayService characteristics for ordinance “tags”
 *   (Communion Sunday, Baptism Sunday, Baby Dedication Sunday)
 *
 * Usage: npx tsx scripts/seed-church-events-from-wordpress.ts
 */
import { PrismaClient } from '@prisma/client';

import { fetchEbenezerbcSeedPayload } from '../src/modules/events/integrations/ebenezerbc-calendar';
import { isServiceCharacteristicMarkerTitle } from '../src/modules/events/utils/sunday-service-characteristic.utils';

const prisma = new PrismaClient();

async function mergeSundayTags(input: {
  serviceDate: string;
  characteristics: string[];
  notes?: string;
}): Promise<'created' | 'updated'> {
  const existing = await prisma.sundayService.findFirst({
    where: { serviceDate: input.serviceDate, status: 'scheduled' },
    orderBy: { updatedAt: 'desc' },
  });

  if (existing) {
    const characteristics = [
      ...new Set([...existing.characteristics, ...input.characteristics]),
    ];
    const notes =
      existing.notes && input.notes && !existing.notes.includes(input.notes)
        ? `${existing.notes}\n${input.notes}`
        : existing.notes ?? input.notes ?? null;
    await prisma.sundayService.update({
      where: { id: existing.id },
      data: { characteristics, notes },
    });
    return 'updated';
  }

  await prisma.sundayService.create({
    data: {
      id: `svc-${crypto.randomUUID().slice(0, 8)}`,
      serviceDate: input.serviceDate,
      title: '',
      characteristics: input.characteristics,
      notes: input.notes ?? null,
      status: 'scheduled',
    },
  });
  return 'created';
}

async function main(): Promise<void> {
  console.log('Fetching events from ebenezerbc.org…');
  const { occurrences, serviceTags } = await fetchEbenezerbcSeedPayload();
  console.log(
    `Materialized ${occurrences.length} event(s) and ${serviceTags.length} Sunday tag date(s).`,
  );

  const ministryIds = new Set(
    (await prisma.ministry.findMany({ select: { id: true } })).map((m) => m.id),
  );

  let created = 0;
  let updated = 0;
  let unmatchedMinistry = 0;
  let tagsCreated = 0;
  let tagsUpdated = 0;

  for (const occurrence of occurrences) {
    let ministryId: string | null = null;
    if (occurrence.ministryId) {
      if (ministryIds.has(occurrence.ministryId)) {
        ministryId = occurrence.ministryId;
      } else {
        unmatchedMinistry += 1;
      }
    }

    const data = {
      title: occurrence.title,
      eventDate: occurrence.eventDate,
      startTime: occurrence.startTime ?? null,
      endTime: occurrence.endTime ?? null,
      location: occurrence.location ?? null,
      notes: occurrence.notes ?? null,
      recurring: occurrence.recurring ?? null,
      eventType: occurrence.eventType,
      status: 'scheduled' as const,
      ministryId,
    };

    const existing = await prisma.churchEvent.findUnique({
      where: { id: occurrence.id },
    });

    if (existing) {
      await prisma.churchEvent.update({
        where: { id: occurrence.id },
        data,
      });
      updated += 1;
    } else {
      await prisma.churchEvent.create({
        data: { id: occurrence.id, ...data },
      });
      created += 1;
    }
  }

  for (const tag of serviceTags) {
    const result = await mergeSundayTags({
      serviceDate: tag.serviceDate,
      characteristics: tag.characteristics,
      notes: tag.notes,
    });
    if (result === 'created') tagsCreated += 1;
    else tagsUpdated += 1;
  }

  // Retire leftover WP marker events that were imported as ChurchEvents before.
  const markerEvents = await prisma.churchEvent.findMany({
    where: { status: 'scheduled' },
    select: { id: true, title: true },
  });
  let cancelledMarkers = 0;
  for (const event of markerEvents) {
    if (!isServiceCharacteristicMarkerTitle(event.title)) continue;
    await prisma.churchEvent.update({
      where: { id: event.id },
      data: { status: 'cancelled' },
    });
    cancelledMarkers += 1;
  }

  console.log(
    JSON.stringify(
      {
        created,
        updated,
        unmatchedMinistry,
        tagsCreated,
        tagsUpdated,
        cancelledMarkers,
        sampleEvents: occurrences.slice(0, 8).map((o) => ({
          id: o.id,
          date: o.eventDate,
          title: o.title,
        })),
        sampleTags: serviceTags.slice(0, 8).map((tag) => ({
          date: tag.serviceDate,
          characteristics: tag.characteristics,
          title: tag.sourceTitle,
        })),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
