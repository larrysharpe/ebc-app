'use client';

import type { ActivityRequest } from '@/modules/events/types/activity-request.types';

export type ActivityPeopleStepProps = {
  value: ActivityRequest;
  onChange: (next: ActivityRequest) => void;
};

export function ActivityPeopleStep({
  value,
  onChange,
}: ActivityPeopleStepProps): React.JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <p className="sm:col-span-2 text-sm text-slate-600">
        Who is putting this on, and about how many people?
      </p>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Contact name</span>
        <input
          value={value.contactName ?? ''}
          onChange={(e) => onChange({ ...value, contactName: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          placeholder="Who should the office call?"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Contact phone</span>
        <input
          value={value.contactPhone ?? ''}
          onChange={(e) => onChange({ ...value, contactPhone: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          placeholder="Optional"
          inputMode="tel"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          About how many people?
        </span>
        <input
          type="number"
          min={0}
          max={5000}
          value={value.participantsEstimate ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            onChange({
              ...value,
              participantsEstimate: raw === '' ? undefined : Number(raw),
            });
          }}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          placeholder="Estimate is fine"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Guest speaker</span>
        <input
          value={value.guestSpeaker ?? ''}
          onChange={(e) => onChange({ ...value, guestSpeaker: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          placeholder="Optional"
        />
      </label>
    </div>
  );
}
