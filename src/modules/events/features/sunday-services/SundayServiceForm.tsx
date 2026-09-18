'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { createSundayServiceAction } from '@/modules/events/actions/sunday-service.actions';
import {
  SERVICE_CHARACTERISTIC_LABELS,
  SERVICE_CHARACTERISTICS,
  type ServiceCharacteristic,
} from '@/modules/events/types/sunday-service.types';
import { formatOrdinalWeekday } from '@/modules/events/utils/ordinal-weekday.utils';
import { getNextUnscheduledDate } from '@/modules/events/utils/sunday-service-date.utils';

export type SundayServiceFormProps = {
  /** ISO dates that already have a scheduled church service. */
  takenDates: string[];
};

export function SundayServiceForm({ takenDates }: SundayServiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ServiceCharacteristic[]>([]);
  const takenKey = takenDates.slice().sort().join('|');
  const [serviceDate, setServiceDate] = useState(() =>
    getNextUnscheduledDate(takenDates),
  );
  const ordinalWeekday = formatOrdinalWeekday(serviceDate);

  useEffect(() => {
    setServiceDate(getNextUnscheduledDate(takenDates));
    // takenKey is a stable fingerprint of takenDates contents
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid reset on new array identity
  }, [takenKey]);

  function toggleCharacteristic(value: ServiceCharacteristic) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await createSundayServiceAction({
        serviceDate: String(formData.get('serviceDate') ?? ''),
        title: String(formData.get('title') ?? ''),
        characteristics: selected,
        notes: String(formData.get('notes') ?? ''),
        startTime: String(formData.get('startTime') ?? ''),
        endTime: String(formData.get('endTime') ?? ''),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      (event.target as HTMLFormElement).reset();
      setSelected([]);
      const nextTaken = [...takenDates, result.service.serviceDate];
      setServiceDate(getNextUnscheduledDate(nextTaken));
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="ebc-card space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ebc-burgundy">Add service</h2>
        <p className="mt-1 text-sm text-slate-600">
          Starts on the next open date. Pick any day — Sunday or midweek.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Service date *</span>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <input
              name="serviceDate"
              type="date"
              required
              value={serviceDate}
              onChange={(event) => setServiceDate(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {ordinalWeekday ? (
              <span className="shrink-0 text-sm font-medium text-ebc-burgundy">
                {ordinalWeekday}
              </span>
            ) : null}
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            name="title"
            placeholder="e.g. Men's Day, Midweek Prayer"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Start time</span>
          <input
            name="startTime"
            type="time"
            defaultValue="11:00"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">End time</span>
          <input
            name="endTime"
            type="time"
            defaultValue="13:00"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Characteristics</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SERVICE_CHARACTERISTICS.map((value) => {
            const active = selected.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleCharacteristic(value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-ebc-burgundy bg-ebc-burgundy text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-ebc-burgundy/40'
                }`}
              >
                {SERVICE_CHARACTERISTIC_LABELS[value]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Notes for directors &amp; leaders
        </span>
        <textarea
          name="notes"
          rows={3}
          placeholder="What should the choir director know? Theme, attire, timing quirks…"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy/90 disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Add service'}
      </button>
    </form>
  );
}
