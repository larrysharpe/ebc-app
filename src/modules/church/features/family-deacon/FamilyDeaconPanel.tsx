import Link from 'next/link';

import { CHURCH_CONTACT } from '@/modules/church/constants/church.constants';

export function FamilyDeaconPanel() {
  return (
    <div className="space-y-6">
      <section className="ebc-card">
        <p className="ebc-section-label">Pastoral care</p>
        <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Your family deacon</h2>
        <p className="mt-3 text-sm text-slate-600">
          Deacons support families through visitations, prayer, communion to the sick and
          shut-in, and practical care. Each household is assigned a family deacon.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          If you are unsure who your family deacon is, contact the Deacon Ministry office and
          they will connect you.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900">Deacon Ministry</h3>
          <p className="mt-2 text-sm text-slate-600">
            Email the ministry office to reach your assigned deacon or request a visit.
          </p>
          <a
            href={`mailto:${CHURCH_CONTACT.deaconMinistryEmail}`}
            className="mt-4 inline-block text-sm font-medium text-ebc-burgundy hover:underline"
          >
            {CHURCH_CONTACT.deaconMinistryEmail}
          </a>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900">Church office</h3>
          <p className="mt-2 text-sm text-slate-600">
            Monday, Wednesday, and Friday · 11:00 AM – 1:00 PM
          </p>
          <p className="mt-3 text-sm text-slate-700">{CHURCH_CONTACT.phone}</p>
          <a
            href={`mailto:${CHURCH_CONTACT.officeEmail}`}
            className="mt-1 inline-block text-sm font-medium text-ebc-burgundy hover:underline"
          >
            {CHURCH_CONTACT.officeEmail}
          </a>
        </div>
      </section>

      <Link href="/church" className="text-sm text-ebc-burgundy hover:underline">
        ← Church life
      </Link>
    </div>
  );
}
