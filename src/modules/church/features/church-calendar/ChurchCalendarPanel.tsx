import Link from 'next/link';

import { WEEKLY_RHYTHM } from '@/lib/church';
import { CHURCH_EXTERNAL_URLS } from '@/modules/church/constants/church.constants';

export function ChurchCalendarPanel() {
  return (
    <div className="space-y-6">
      <section className="ebc-card">
        <p className="ebc-section-label">Schedule</p>
        <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Church calendar</h2>
        <p className="mt-3 text-sm text-slate-600">
          Worship, Bible study, and church-wide events. The full public calendar lives on
          ebenezerbc.org — ministry-specific events appear in each ministry&apos;s calendar
          inside EBC APP.
        </p>
        <a
          href={CHURCH_EXTERNAL_URLS.calendar}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark"
        >
          Open church calendar
        </a>
      </section>

      <section className="ebc-card">
        <h3 className="text-lg font-bold text-ebc-burgundy">Weekly rhythm</h3>
        <ul className="mt-4 space-y-4">
          {WEEKLY_RHYTHM.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.note}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-ebc-burgundy">{item.schedule}</p>
                <p className="text-sm text-slate-600">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <a
        href={CHURCH_EXTERNAL_URLS.announcements}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-ebc-burgundy/40"
      >
        <h3 className="font-semibold text-slate-900">Announcements</h3>
        <p className="mt-2 text-sm text-slate-600">Latest church news on ebenezerbc.org</p>
      </a>

      <Link href="/church" className="text-sm text-ebc-burgundy hover:underline">
        ← Church life
      </Link>
    </div>
  );
}
