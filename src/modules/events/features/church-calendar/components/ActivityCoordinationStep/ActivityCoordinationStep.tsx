'use client';

import {
  ACTIVITY_HELP_FROM,
  ACTIVITY_HELP_FROM_LABELS,
  type ActivityHelpFrom,
} from '@/modules/events/constants/activity-request.constants';
import type { ActivityRequest } from '@/modules/events/types/activity-request.types';

export type ActivityCoordinationStepProps = {
  value: ActivityRequest;
  onChange: (next: ActivityRequest) => void;
  showSaturdayTrusteeNote?: boolean;
};

export function ActivityCoordinationStep({
  value,
  onChange,
  showSaturdayTrusteeNote = false,
}: ActivityCoordinationStepProps): React.JSX.Element {
  const coord = value.coordination;

  function setCoord(
    partial: Partial<ActivityRequest['coordination']>,
  ): void {
    onChange({ ...value, coordination: { ...coord, ...partial } });
  }

  function toggleHelp(item: ActivityHelpFrom): void {
    const selected = coord.helpFrom.includes(item);
    setCoord({
      helpFrom: selected
        ? coord.helpFrom.filter((value) => value !== item)
        : [...coord.helpFrom, item],
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        What else should the office and teams know?
      </p>

      {showSaturdayTrusteeNote ? (
        <p
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          Saturday after noon — a duty trustee is usually on site. Consider
          requesting Trustee help below.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ['bulletin', 'Include in the bulletin'],
            ['otherChurches', 'Invite other churches'],
            ['flyerCopies', 'Flyer copies'],
            ['financialVoucher', 'Financial voucher / funds'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="ebc-choice">
            <input
              type="checkbox"
              checked={coord[key]}
              onChange={(e) => setCoord({ [key]: e.target.checked })}
              className="h-4 w-4 shrink-0 rounded border-slate-300"
            />
            <span className="text-sm font-medium">{label}</span>
          </label>
        ))}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">
          Help from
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIVITY_HELP_FROM.map((item) => {
            const selected = coord.helpFrom.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleHelp(item)}
                className={`ebc-choice min-h-11 rounded-lg px-3 py-2 text-sm font-medium ${
                  selected
                    ? 'border-ebc-burgundy bg-ebc-burgundy text-white'
                    : 'border border-slate-300 bg-white text-slate-700'
                }`}
              >
                {ACTIVITY_HELP_FROM_LABELS[item]}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
