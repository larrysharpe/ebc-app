import type { Ministry, MinistryPersonRole } from '@/modules/ministries/types';

export type PersonMinistryAffiliation = {
  ministryId: string;
  slug: string;
  name: string;
  rosterRole: MinistryPersonRole;
  title?: string;
  personnelId: string;
};

/** Roster placements for a directory person across ministries. */
export function affiliationsForPerson(
  personId: string,
  ministries: readonly Ministry[],
): PersonMinistryAffiliation[] {
  const affiliations: PersonMinistryAffiliation[] = [];

  for (const ministry of ministries) {
    for (const member of ministry.personnel) {
      if (member.personId !== personId) continue;
      affiliations.push({
        ministryId: ministry.id,
        slug: ministry.slug,
        name: ministry.name,
        rosterRole: member.role,
        title: member.title,
        personnelId: member.id,
      });
    }
  }

  return affiliations.sort((a, b) => a.name.localeCompare(b.name));
}
