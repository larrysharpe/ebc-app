import Link from 'next/link';

import { CHURCH_CONTACT } from '@/modules/church/constants/church.constants';
import { LEGAL_PATHS } from '@/modules/legal';

export function PrayerRequestPanel() {
  return (
    <div className="space-y-6">
      <section className="ebc-card">
        <p className="ebc-section-label">Prayer ministry</p>
        <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Request prayer</h2>
        <p className="mt-3 text-sm text-slate-600">
          Share a prayer need with the pastoral care team. Requests go by email — they are not
          stored in EBC APP and are not posted to the congregation. For urgent pastoral care,
          call the church office during office hours.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          If you or someone you love is in crisis, call 988 or 911.
        </p>
      </section>

      <section className="rounded-xl border border-ebc-burgundy/20 bg-ebc-burgundy/5 p-5">
        <h3 className="font-semibold text-ebc-burgundy-dark">Send a prayer request</h3>
        <p className="mt-2 text-sm text-slate-600">
          Email your request — include your name and phone if you would like someone to follow
          up with you. Share only what you are willing for the pastoral care team to read. Do
          not include someone else’s private situation without their permission.
        </p>
        <a
          href={`mailto:${CHURCH_CONTACT.prayerEmail}?subject=${encodeURIComponent('Prayer request')}`}
          className="mt-4 inline-flex rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark"
        >
          Email {CHURCH_CONTACT.prayerEmail}
        </a>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-900">Wednesday prayer & Bible study</h3>
        <p className="mt-2 text-sm text-slate-600">
          Join noon day prayer (12:00 PM) and evening Bible study (7:00 PM) on Zoom. Prayer
          requests shared in those gatherings are also routed through the pastoral team.
        </p>
      </section>

      <p className="text-sm text-slate-600">
        <Link href={LEGAL_PATHS.privacy} className="text-ebc-burgundy hover:underline">
          Privacy policy
        </Link>
        {' · '}
        how prayer and other church information is handled.
      </p>

      <Link href="/church" className="text-sm text-ebc-burgundy hover:underline">
        ← Church life
      </Link>
    </div>
  );
}
