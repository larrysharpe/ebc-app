import Link from 'next/link';

import { CHURCH_EXTERNAL_URLS } from '@/modules/church/constants/church.constants';
import { LEGAL_PATHS } from '@/modules/legal';

export function ChurchGivingPanel() {
  return (
    <div className="space-y-6">
      <section className="ebc-card">
        <p className="ebc-section-label">Stewardship</p>
        <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Give</h2>
        <p className="mt-3 text-sm text-slate-600">
          Tithes, offerings, and designated gifts are processed through Realm and the church
          website. Giving records stay in Realm — EBC APP links you to the official giving
          channels.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={CHURCH_EXTERNAL_URLS.giving}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-ebc-green/30 bg-ebc-green/5 p-5 transition hover:border-ebc-green"
        >
          <h3 className="font-semibold text-slate-900">Give online</h3>
          <p className="mt-2 text-sm text-slate-600">ebenezerbc.org give page</p>
          <p className="mt-3 text-sm font-medium text-ebc-burgundy">Open giving page →</p>
        </a>

        <a
          href={CHURCH_EXTERNAL_URLS.realm}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-ebc-gold/50 bg-ebc-gold/10 p-5 transition hover:border-ebc-gold"
        >
          <h3 className="font-semibold text-slate-900">Realm Connect</h3>
          <p className="mt-2 text-sm text-slate-600">Mobile app for giving and church community</p>
          <p className="mt-3 text-sm font-medium text-ebc-burgundy">Open Realm →</p>
        </a>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <p>
          Questions about online giving? Contact{' '}
          <a href="mailto:onlinegiving@ebenezerbc.org" className="text-ebc-burgundy hover:underline">
            onlinegiving@ebenezerbc.org
          </a>
          . Gift amounts stay in Realm — see the{' '}
          <Link href={LEGAL_PATHS.privacy} className="text-ebc-burgundy hover:underline">
            Privacy policy
          </Link>
          .
        </p>
      </section>

      <Link href="/church" className="text-sm text-ebc-burgundy hover:underline">
        ← Church life
      </Link>
    </div>
  );
}
