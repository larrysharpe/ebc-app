import type { BandMusician } from '../types';
import {
  BAND_INSTRUMENT_LABELS,
  BAND_INSTRUMENT_ORDER,
  MUSICIAN_ROLE_LABELS,
} from '../types';
import { formatSundayLabel } from '../utils/choir-schedule.utils';
import {
  buildSundayBandMatrix,
  formatMusicianDetail,
  formatMusicianInstruments,
  formatMusicianName,
  formatMusicianSchedule,
  getUpcomingGuests,
  groupBandByInstrument,
} from '../utils/band-roster.utils';

type BandRosterPanelProps = {
  roster: BandMusician[];
  showSundayMatrix?: boolean;
};

export function BandRosterPanel({ roster, showSundayMatrix = false }: BandRosterPanelProps) {
  const byInstrument = groupBandByInstrument(roster);
  const sundayMatrix = showSundayMatrix ? buildSundayBandMatrix(roster) : [];
  const upcomingGuests = getUpcomingGuests(roster);

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-lg text-ebc-burgundy">Band depth chart</h2>
        <p className="mt-1 text-sm text-slate-600">
          Musicians by primary instrument — ranked by chart role, with secondary covers and Sunday
          rotation.
        </p>
      </div>

      {upcomingGuests.length > 0 ? (
        <div className="border-b border-amber-100 bg-amber-50/70 px-5 py-4">
          <h3 className="text-sm font-semibold text-amber-900">Upcoming guests</h3>
          <ul className="mt-3 space-y-2">
            {upcomingGuests.map((guest) => (
              <li key={guest.id} className="flex flex-wrap items-start justify-between gap-2 text-sm">
                <div>
                  <span className="font-medium text-slate-900">{formatMusicianName(guest)}</span>
                  <span className="ml-2 text-slate-600">
                    {formatMusicianInstruments(guest)}
                  </span>
                </div>
                <span className="font-medium text-ebc-burgundy">{formatMusicianSchedule(guest)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="divide-y divide-slate-100">
        {BAND_INSTRUMENT_ORDER.map((instrument) => {
          const musicians = byInstrument[instrument];
          if (musicians.length === 0) return null;

          return (
            <div key={instrument} className="px-5 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ebc-gold">
                {BAND_INSTRUMENT_LABELS[instrument]}
              </h3>
              <ul className="mt-3 space-y-3">
                {musicians.map((musician, index) => (
                  <li key={musician.id} className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">
                        <span className="mr-1.5 text-xs font-semibold text-slate-400">
                          #{index + 1}
                        </span>
                        {formatMusicianName(musician)}
                        <span className="ml-2 rounded bg-ebc-burgundy/10 px-2 py-0.5 text-xs font-medium text-ebc-burgundy">
                          {MUSICIAN_ROLE_LABELS[musician.role]}
                        </span>
                      </p>
                      {(musician.secondaryInstruments?.length ?? 0) > 0 ? (
                        <p className="mt-0.5 text-sm text-slate-600">
                          {formatMusicianInstruments(musician)}
                        </p>
                      ) : null}
                      {musician.notes && (
                        <p className="mt-0.5 text-sm text-slate-500">{musician.notes}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-ebc-burgundy">
                      {formatMusicianSchedule(musician)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {showSundayMatrix && (
        <div className="border-t border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">By Sunday</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">Sunday</th>
                  {BAND_INSTRUMENT_ORDER.map((instrument) => (
                    <th key={instrument} className="px-2 py-2">
                      {BAND_INSTRUMENT_LABELS[instrument]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sundayMatrix.map(({ sunday, byInstrument: slots }) => (
                  <tr key={sunday}>
                    <td className="whitespace-nowrap px-2 py-2 font-medium text-ebc-burgundy">
                      {formatSundayLabel(sunday)}
                    </td>
                    {BAND_INSTRUMENT_ORDER.map((instrument) => {
                      const names = slots[instrument];
                      return (
                        <td key={instrument} className="px-2 py-2 text-slate-700">
                          {names.length === 0
                            ? '—'
                            : names.map((m) => formatMusicianName(m)).join(', ')}
                          {names.some((m) => m.everyOther2nd) && (
                            <span className="block text-xs text-slate-500">alt. 2nd</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        Song fill-in musicians (e.g. Larry Sharpe III &amp; IV) are not on fixed Sundays — call
        them for individual songs. Emergency and backup cover full services when needed.
      </div>
    </section>
  );
}

export function BandRosterSummary({ roster }: { roster: BandMusician[] }) {
  const byInstrument = groupBandByInstrument(roster);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {BAND_INSTRUMENT_ORDER.map((instrument) => {
        const musicians = byInstrument[instrument];
        return (
          <div key={instrument} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ebc-gold">
              {BAND_INSTRUMENT_LABELS[instrument]}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {musicians.map((m, index) => (
                <li key={m.id}>
                  <span className="text-xs text-slate-400">#{index + 1} </span>
                  <span className="font-medium">{formatMusicianName(m)}</span>
                  <span className="text-slate-500">
                    {' '}
                    · {MUSICIAN_ROLE_LABELS[m.role]} · {formatMusicianDetail(m)}
                  </span>
                  {(m.secondaryInstruments?.length ?? 0) > 0 ? (
                    <span className="block text-xs text-slate-500">
                      also {m.secondaryInstruments.map((i) => BAND_INSTRUMENT_LABELS[i]).join(', ')}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
