import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import type { SessionUser } from '@/modules/auth/types/auth.types';
import { resolveScopedChoirIds } from '@/modules/auth/utils/choir-scope.utils';
import { filterMinistriesForUser } from '@/modules/auth/utils/ministry-scope.utils';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { canAccessRoute } from '@/modules/auth/utils/route-access.utils';
import { parseSopContent, evaluateSopQuality } from '@/modules/ministries/features/ministry-detail/components/SopPanel/sop-editor.utils';
import { listMinistries } from '@/modules/ministries/repositories/ministry.repository';
import { getSopConfig } from '@/modules/leadership/repositories/sop-config.repository';
import { getPersonByEmail } from '@/modules/members/repositories/person.repository';
import {
  filterPlansForDirectorScope,
  ledChoirIdsForPerson,
} from '@/modules/music/features/my-choirs';
import { listChoirs } from '@/modules/music/repository/choir.repository';
import { getPlans } from '@/modules/music/repository/music.repository';
import { listVisitors } from '@/modules/visitors/repositories/visitor.repository';

import type {
  HomeDashboardData,
  HomeMinistryCard,
  OperationalSnapshot,
} from '../types/dashboard.types';
import { buildAttentionItems } from '../utils/home-attention.utils';

const UPCOMING_DAYS = 14;

function requiresSafetyCategory(category: string): boolean {
  return category === 'fellowship' || category === 'outreach' || category === 'education';
}

function isWithinDays(iso: string, days: number): boolean {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  const date = new Date(iso);
  return date >= start && date <= end;
}

export async function getOperationalSnapshot(
  session?: SessionUser | null,
): Promise<OperationalSnapshot> {
  const [allMinistries, plans, sopConfig, visitors, choirs, person] =
    await Promise.all([
      listMinistries(),
      getPlans(),
      getSopConfig(),
      listVisitors(),
      listChoirs(),
      session?.email ? getPersonByEmail(session.email) : Promise.resolve(null),
    ]);

  const ministries = session
    ? filterMinistriesForUser(session, allMinistries)
    : allMinistries;

  const music = session ? getMusicAccess(session.roles) : null;
  const includeVisitors = session ? canAccessRoute(session, '/visitors') : true;

  const upcomingEvents = ministries
    .flatMap((ministry) =>
      ministry.events.map((event) => ({
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        location: event.location,
        ministrySlug: ministry.slug,
        ministryName: ministry.name,
      })),
    )
    .filter((event) => isWithinDays(event.startAt, UPCOMING_DAYS))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const allDrafts = plans
    .filter((plan) => plan.status === 'draft')
    .map((plan) => ({
      id: plan.id,
      title: plan.title,
      serviceDate: plan.serviceDate,
      choirGroup: plan.choirGroup,
      songCount: plan.songs.length,
    }));

      const draftPlans =
    !music || !music.canEditPlans
      ? []
      : filterPlansForDirectorScope(allDrafts, {
          seeAll: music.canManageRotation,
          ledChoirIds: resolveScopedChoirIds(
            session?.choirIds ?? [],
            ledChoirIdsForPerson(choirs, person?.id),
          ),
        });

  const sopGaps = ministries.flatMap((ministry) =>
    ministry.sops
      .map((sop) => {
        const draft = parseSopContent(
          sop.content,
          sop.title,
          sopConfig.sections,
          sop.templateId ?? 'general',
        );
        const { score, readyToPublish } = evaluateSopQuality(draft, sopConfig, {
          requiresSafety: requiresSafetyCategory(ministry.category),
        });

        if (readyToPublish) return null;

        return {
          ministrySlug: ministry.slug,
          ministryName: ministry.name,
          sopTitle: sop.title,
          score,
          minScore: sopConfig.minQualityScore,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  );

  const newVisitors = includeVisitors
    ? visitors
        .filter((visitor) => visitor.status === 'new')
        .slice(0, 10)
        .map((visitor) => ({
          id: visitor.id,
          name: `${visitor.firstName} ${visitor.lastName}`,
          visitDate: visitor.visitDate,
          status: visitor.status,
        }))
    : [];

  const ministriesWithoutPersonnel = ministries
    .filter((ministry) => ministry.personnel.length === 0)
    .map((ministry) => ({ slug: ministry.slug, name: ministry.name }));

  return {
    draftPlans,
    upcomingEvents,
    sopGaps,
    newVisitors,
    ministriesWithoutPersonnel,
  };
}

function buildMyMinistries(
  session: SessionUser,
  ministries: Awaited<ReturnType<typeof listMinistries>>,
): HomeMinistryCard[] {
  const scoped = filterMinistriesForUser(session, ministries);
  const cards: HomeMinistryCard[] = scoped.map((ministry) => {
    const upcomingCount = ministry.events.filter((event) =>
      isWithinDays(event.startAt, UPCOMING_DAYS),
    ).length;
    const openRoles = ministry.personnel.filter((person) => person.isOpenRole).length;
    const rosterFilled = ministry.personnel.filter((person) => !person.isOpenRole).length;

    const metaParts = [
      upcomingCount > 0
        ? `${upcomingCount} upcoming event${upcomingCount === 1 ? '' : 's'}`
        : null,
      openRoles > 0 ? `${openRoles} open role${openRoles === 1 ? '' : 's'}` : null,
      `${rosterFilled} on roster`,
    ].filter(Boolean);

    return {
      id: ministry.id,
      slug: ministry.slug,
      name: ministry.name,
      description: ministry.description,
      href: `/ministries/${ministry.slug}`,
      meta: metaParts.join(' · '),
    };
  });

  const music = getMusicAccess(session.roles);
  if (music.canView && cards.every((card) => card.slug !== 'music')) {
    const hasMusicMinistry = scoped.some(
      (ministry) =>
        ministry.slug === 'music' || ministry.name.toLowerCase().includes('music'),
    );
    if (!hasMusicMinistry) {
      cards.push({
        id: 'music-hub',
        slug: 'music',
        name: 'Music',
        description: 'Choir plans, songs, band, and rehearsal tools',
        href: '/music',
        meta: music.canEditPlans ? 'Plans & repertoire' : 'Rehearse & respond',
      });
    }
  }

  return cards.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getHomeDashboardData(
  session: SessionUser,
): Promise<HomeDashboardData> {
  const [snapshot, ministries] = await Promise.all([
    getOperationalSnapshot(session),
    listMinistries(),
  ]);

  const music = getMusicAccess(session.roles);
  const attentionItems = buildAttentionItems({
    draftPlans: snapshot.draftPlans,
    newVisitors: snapshot.newVisitors,
    sopGaps: snapshot.sopGaps,
    ministriesWithoutPersonnel: snapshot.ministriesWithoutPersonnel,
    includeDraftPlans: music.canEditPlans,
    includeVisitors: canAccessRoute(session, '/visitors'),
  });

  return {
    greetingName: session.name.split(' ')[0] || session.name,
    roleLabel: session.roles.map((role) => ROLE_LABELS[role]).join(' · '),
    attentionItems,
    myMinistries: buildMyMinistries(session, ministries),
    snapshot,
  };
}
