'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { saveChoirDirectorSettingsAction } from '@/modules/music/actions/director-settings.actions';
import type { ChoirGroup, PlanSongSlotType } from '@/modules/music/types';
import type { Choir } from '@/modules/music/types/choir.types';
import type {
  ChoirDirectorSettings,
  DefaultPracticeTemplate,
} from '@/modules/music/types/director-settings.types';
import { getActiveChoirs } from '@/modules/music/utils/choir.utils';
import { normalizeDefaultPractices } from '@/modules/music/utils/director-settings.utils';

import { DefaultPracticesEditor } from './components/DefaultPracticesEditor';
import { DefaultServiceSlotsEditor } from './components/DefaultServiceSlotsEditor';

export type DirectorSettingsFormProps = {
  settings: ChoirDirectorSettings;
  choirs: Choir[];
};

export function DirectorSettingsForm({ settings, choirs }: DirectorSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [defaultServiceSlots, setDefaultServiceSlots] = useState<PlanSongSlotType[]>(
    settings.defaultServiceSlots,
  );
  const [defaultPractices, setDefaultPractices] = useState<DefaultPracticeTemplate[]>(
    () =>
      normalizeDefaultPractices(settings.defaultPractices, {
        practiceWeekday: settings.practiceWeekday,
        practiceStartTime: settings.practiceStartTime,
        practiceEndTime: settings.practiceEndTime,
      }),
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await saveChoirDirectorSettingsAction({
        defaultChoirGroup: String(formData.get('defaultChoirGroup') ?? '') as ChoirGroup,
        serviceStartTime: String(formData.get('serviceStartTime') ?? ''),
        serviceEndTime: String(formData.get('serviceEndTime') ?? ''),
        defaultPractices,
        defaultServiceSlots,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDefaultServiceSlots(result.settings.defaultServiceSlots);
      setDefaultPractices(result.settings.defaultPractices);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="ebc-card space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ebc-burgundy">Defaults for new plans</h2>
        <p className="mt-1 text-sm text-slate-600">
          New choir plans start with these values. You can still change them on each plan.
          Choir group follows the chapel rotation when the service date is a Sunday.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Settings saved.
        </p>
      ) : null}

      <label className="block max-w-md">
        <span className="text-sm font-medium text-slate-700">Default choir</span>
        <select
          name="defaultChoirGroup"
          defaultValue={settings.defaultChoirGroup}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {getActiveChoirs(choirs).map((choir) => (
            <option key={choir.id} value={choir.id}>
              {choir.name}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-slate-500">
          Used when the service date is not a Sunday (no chapel rotation).
        </span>
      </label>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-900">Default service time</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Start time</span>
            <input
              name="serviceStartTime"
              type="time"
              required
              defaultValue={settings.serviceStartTime}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">End time</span>
            <input
              name="serviceEndTime"
              type="time"
              required
              defaultValue={settings.serviceEndTime}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </fieldset>

      <DefaultPracticesEditor
        value={defaultPractices}
        onChange={setDefaultPractices}
        disabled={isPending}
      />

      <DefaultServiceSlotsEditor
        value={defaultServiceSlots}
        onChange={setDefaultServiceSlots}
        disabled={isPending}
      />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy/90 disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
