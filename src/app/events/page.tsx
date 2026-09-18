import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import {
  canApproveActivityRequest,
  canManageChurchCalendar,
  ChurchEventForm,
  ChurchEventList,
  filterCalendarEvents,
} from '@/modules/events';
import { listChurchEvents } from '@/modules/events/repositories/church-event.repository';
import { listMinistries } from '@/modules/ministries';
import { getUserUiPreferences } from '@/modules/preferences/server';

export default async function EventsPage() {
  const session = await getSession();
  const canManage = Boolean(session && canManageChurchCalendar(session.roles));
  const canApprove = Boolean(session && canApproveActivityRequest(session.roles));
  if (!session || (!canManage && !canApprove)) {
    redirect('/?denied=1');
  }

  const [rawEvents, ministries, uiPreferences] = await Promise.all([
    listChurchEvents({ includeCancelled: true }),
    listMinistries(),
    getUserUiPreferences(session.id),
  ]);
  const events = filterCalendarEvents(rawEvents);

  const ministryOptions = ministries.map((ministry) => ({
    id: ministry.id,
    name: ministry.name,
  }));
  const takenDates = events
    .filter((event) => event.status === 'scheduled' && event.eventDate)
    .map((event) => event.eventDate as string);

  return (
    <AppShell
      currentPath="/events"
      title="Events"
      subtitle="Staff church calendar — source of truth for planning"
    >
      <div className="space-y-8">
        <Link
          href="/events/services"
          className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-ebc-burgundy/40"
        >
          <h2 className="font-display text-lg text-ebc-burgundy">Worship services</h2>
          <p className="mt-2 text-sm text-slate-600">
            Schedule Sunday and midweek worship services for choir directors (special
            characteristics, times, notes).
          </p>
        </Link>

        {canManage ? (
          <ChurchEventForm
            ministries={ministryOptions}
            takenDates={takenDates}
            voiceCoachPreference={uiPreferences.voiceCoachPreference}
          />
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            You can approve pending activity requests below. Creating events is limited to
            office staff and pastors.
          </p>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ebc-burgundy">Upcoming</h2>
          <ChurchEventList
            events={events}
            canManage={canManage}
            canApprove={canApprove}
          />
        </section>
      </div>
    </AppShell>
  );
}
