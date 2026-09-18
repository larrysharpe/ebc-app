import type { ReactNode } from 'react';

import { RichTextContent } from '@/components/ui/RichTextEditor';

import type { ServiceMusicPlan, Song } from '../../../types';
import { SLOT_TYPE_LABELS } from '../../../types';
import { getChoirName } from '../../../utils/choir.utils';
import {
  buildPlanGreeting,
  formatPracticeDateTime,
  formatServiceDate,
  resolveSlotArtist,
  resolveSlotTitle,
  resolveSlotYoutube,
  songsToMap,
} from '../../../utils/music.format';
import { formatSundayLabel } from '../../../utils/choir-schedule.utils';
import {
  formatPlanServiceRole,
  isPlanServiceRoleNa,
  planServiceRolesCallout,
} from '../../../utils/plan-service-role.utils';

type PlanEmailPreviewProps = {
  plan: ServiceMusicPlan;
  songs: Song[];
};

function PlanServiceRoleDisplay({
  value,
}: {
  value: string | null | undefined;
}): ReactNode {
  const formatted = formatPlanServiceRole(value);
  if (!value?.trim() && !isPlanServiceRoleNa(value)) {
    return <span className="text-slate-400">{formatted}</span>;
  }
  return formatted;
}

export function PlanEmailPreview({ plan, songs }: PlanEmailPreviewProps) {
  const songsById = songsToMap(songs);
  const sorted = [...plan.songs].sort((a, b) => a.sortOrder - b.sortOrder);
  const practice = formatPracticeDateTime(plan);
  const rolesCallout = planServiceRolesCallout(
    plan.scriptureReader,
    plan.prayerLeader,
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Choir plan preview — as Sister Stewart sends it
        </p>
        <h2 className="mt-1 font-display text-xl text-ebc-burgundy">
          {getChoirName(plan.choirGroup)}
          {plan.sundayOfMonth && (
            <span className="font-normal text-slate-600">
              {' '}
              · {formatSundayLabel(plan.sundayOfMonth)}
            </span>
          )}
        </h2>
        <p className="text-sm text-slate-600">
          Service: {formatServiceDate(plan.serviceDate)}
        </p>
        {plan.scheduleOverride && plan.scheduleNote && (
          <p className="mt-2 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Schedule swap: {plan.scheduleNote}
          </p>
        )}
      </header>

      <div className="space-y-5 px-6 py-6 font-sans text-[15px] leading-relaxed text-slate-800">
        <p className="font-medium">{buildPlanGreeting(plan)}</p>

        {practice && (
          <p>
            Our choir practice will be{' '}
            <span className="font-semibold text-ebc-burgundy">{practice}</span>
            {plan.practiceLocation ? ` in the ${plan.practiceLocation}.` : '.'}
          </p>
        )}

        {plan.occasion && <p>{plan.occasion}</p>}

        {plan.attire && (
          <p>
            <span className="font-semibold">Attire</span> — {plan.attire}
          </p>
        )}

        <div className="rounded-lg border border-dashed border-ebc-gold/60 bg-ebc-gold/5 px-4 py-3">
          {rolesCallout ? <p className="font-medium">{rolesCallout}</p> : null}
          <div
            className={
              rolesCallout
                ? 'mt-3 grid gap-2 sm:grid-cols-2'
                : 'grid gap-2 sm:grid-cols-2'
            }
          >
            <p>
              <span className="font-semibold">Scripture:</span>{' '}
              <PlanServiceRoleDisplay value={plan.scriptureReader} />
            </p>
            <p>
              <span className="font-semibold">Prayer:</span>{' '}
              <PlanServiceRoleDisplay value={plan.prayerLeader} />
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-ebc-burgundy">Song selections</h3>
          <ol className="space-y-4">
            {sorted.map((slot) => {
              const title = resolveSlotTitle(slot, songsById);
              const artist = resolveSlotArtist(slot, songsById);
              const youtube = resolveSlotYoutube(slot, songsById);
              const slotLabel = SLOT_TYPE_LABELS[slot.slotType];

              return (
                <li key={slot.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ebc-burgundy/10 text-sm font-bold text-ebc-burgundy">
                    {slot.sortOrder}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {slot.slotType !== 'worship' && slot.slotType !== 'welcome' && (
                        <span className="mr-1 text-xs uppercase tracking-wide text-ebc-gold">
                          {slotLabel}
                        </span>
                      )}
                      {title}
                      {artist && (
                        <span className="font-normal text-slate-600"> — {artist}</span>
                      )}
                    </p>
                    <p className="text-sm text-ebc-burgundy">
                      <span className="font-semibold">{slot.assignments}</span>
                    </p>
                    {slot.sectionNotes && (
                      <p className="mt-1 text-sm italic text-slate-600">{slot.sectionNotes}</p>
                    )}
                    {slot.notes && (
                      <p className="mt-1 text-sm text-slate-500">Note: {slot.notes}</p>
                    )}
                    {youtube && (
                      <a
                        href={youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                      >
                        ▶ YouTube reference
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {plan.directorNotes && (
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Director notes</p>
            <div className="mt-1">
              <RichTextContent value={plan.directorNotes} />
            </div>
          </div>
        )}

        <p className="font-medium">
          Start learning!
          <br />
          Be blessed,
          <br />
          {plan.directorName}
        </p>
      </div>
    </article>
  );
}
