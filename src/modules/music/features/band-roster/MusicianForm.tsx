'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { personDisplayName, type Person } from '@/modules/members/types/person.types';
import { saveBandMusicianAction } from '@/modules/music/actions/band-roster.actions';
import type {
  BandInstrument,
  BandMusician,
  BandPlayerType,
  MusicianSlotRole,
  SundayOfMonth,
} from '@/modules/music/types';
import {
  BAND_INSTRUMENT_LABELS,
  BAND_INSTRUMENT_ORDER,
  MUSICIAN_ROLE_DESCRIPTIONS,
  MUSICIAN_ROLE_LABELS,
  MUSICIAN_ROLE_ORDER,
} from '@/modules/music/types';

const SUNDAY_OPTIONS: SundayOfMonth[] = [1, 2, 3, 4, 5];

export type MusicianFormProps = {
  initial?: BandMusician;
  people: Person[];
  defaultPlayerType?: BandPlayerType;
  onCancel: () => void;
  onSaved?: () => void;
};

export function MusicianForm({
  initial,
  people,
  defaultPlayerType = 'regular',
  onCancel,
  onSaved,
}: MusicianFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [playerType, setPlayerType] = useState<BandPlayerType>(
    initial?.playerType ?? defaultPlayerType,
  );
  const [personId, setPersonId] = useState(initial?.personId ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [primaryInstrument, setPrimaryInstrument] = useState<BandInstrument>(
    initial?.instrument ?? 'keys',
  );
  const [role, setRole] = useState<MusicianSlotRole>(initial?.role ?? 'primary');
  const [secondaryInstruments, setSecondaryInstruments] = useState<BandInstrument[]>(
    initial?.secondaryInstruments ?? [],
  );
  const [selectedSundays, setSelectedSundays] = useState<SundayOfMonth[]>(
    initial?.sundays ?? [],
  );

  const peopleOptions = useMemo(
    () =>
      [...people].sort((a, b) =>
        personDisplayName(a).localeCompare(personDisplayName(b)),
      ),
    [people],
  );

  function toggleSunday(sunday: SundayOfMonth): void {
    setSelectedSundays((current) =>
      current.includes(sunday)
        ? current.filter((value) => value !== sunday)
        : [...current, sunday].sort((a, b) => a - b),
    );
  }

  function toggleSecondary(instrument: BandInstrument): void {
    setSecondaryInstruments((current) =>
      current.includes(instrument)
        ? current.filter((value) => value !== instrument)
        : [...current, instrument],
    );
  }

  function handlePersonChange(nextId: string): void {
    setPersonId(nextId);
    if (!nextId) return;
    const person = people.find((row) => row.id === nextId);
    if (person) setName(personDisplayName(person));
  }

  function handlePrimaryChange(next: BandInstrument): void {
    setPrimaryInstrument(next);
    setSecondaryInstruments((current) =>
      current.filter((instrument) => instrument !== next),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const depthOrderRaw = Number.parseInt(String(formData.get('depthOrder') ?? '0'), 10);

    const payload = {
      id: initial?.id,
      name: name.trim() || String(formData.get('name') ?? ''),
      personId: personId || undefined,
      instrument: primaryInstrument,
      secondaryInstruments,
      playerType,
      guestServiceDate: String(formData.get('guestServiceDate') ?? '') || undefined,
      sundays: playerType === 'regular' ? selectedSundays : undefined,
      everyOther2nd: playerType === 'regular' && formData.get('everyOther2nd') === 'on',
      role,
      depthOrder: Number.isFinite(depthOrderRaw) ? depthOrderRaw : 0,
      namePending: formData.get('namePending') === 'on',
      notes: String(formData.get('notes') ?? '') || undefined,
    };

    startTransition(async () => {
      const result = await saveBandMusicianAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved?.();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="font-display text-lg text-ebc-burgundy">
        {initial ? 'Edit musician' : playerType === 'guest' ? 'Add guest player' : 'Add musician'}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Depth chart: primary instrument, secondary covers, and chart position.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Directory person</span>
          <select
            value={personId}
            onChange={(event) => handlePersonChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Not linked — type a name below</option>
            {peopleOptions.map((person) => (
              <option key={person.id} value={person.id}>
                {personDisplayName(person)}
                {person.membershipStatus === 'hired' ? ' (hired)' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Display name</span>
          <input
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Primary instrument</span>
          <select
            name="instrument"
            value={primaryInstrument}
            onChange={(event) =>
              handlePrimaryChange(event.target.value as BandInstrument)
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {BAND_INSTRUMENT_ORDER.map((instrument) => (
              <option key={instrument} value={instrument}>
                {BAND_INSTRUMENT_LABELS[instrument]}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Depth chart role</span>
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as MusicianSlotRole)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {MUSICIAN_ROLE_ORDER.map((option) => (
              <option key={option} value={option}>
                {MUSICIAN_ROLE_LABELS[option]}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-slate-500">
            {MUSICIAN_ROLE_DESCRIPTIONS[role]}
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Depth order</span>
          <input
            name="depthOrder"
            type="number"
            min={0}
            max={99}
            defaultValue={initial?.depthOrder ?? 0}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-slate-500">
            Lower number ranks higher within the same role (0 = top).
          </span>
        </label>

        <fieldset className="block sm:col-span-2">
          <legend className="text-sm font-medium text-slate-700">Secondary instruments</legend>
          <p className="mt-1 text-xs text-slate-500">
            Other instruments this musician can cover on the depth chart.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BAND_INSTRUMENT_ORDER.filter(
              (instrument) => instrument !== primaryInstrument,
            ).map((instrument) => (
              <label
                key={instrument}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={secondaryInstruments.includes(instrument)}
                  onChange={() => toggleSecondary(instrument)}
                />
                {BAND_INSTRUMENT_LABELS[instrument]}
              </label>
            ))}
          </div>
        </fieldset>

        {playerType === 'guest' ? (
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Service date</span>
            <input
              name="guestServiceDate"
              type="date"
              required
              defaultValue={initial?.guestServiceDate ?? ''}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        ) : (
          <>
            <fieldset className="block sm:col-span-2">
              <legend className="text-sm font-medium text-slate-700">Sundays of the month</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUNDAY_OPTIONS.map((sunday) => (
                  <label
                    key={sunday}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSundays.includes(sunday)}
                      onChange={() => toggleSunday(sunday)}
                    />
                    {sunday}
                    {sunday === 1 ? 'st' : sunday === 2 ? 'nd' : sunday === 3 ? 'rd' : 'th'}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="inline-flex items-center gap-2 sm:col-span-2">
              <input
                name="everyOther2nd"
                type="checkbox"
                defaultChecked={initial?.everyOther2nd ?? false}
              />
              <span className="text-sm text-slate-700">Alternates every other 2nd Sunday</span>
            </label>
          </>
        )}

        <label className="inline-flex items-center gap-2 sm:col-span-2">
          <input
            name="namePending"
            type="checkbox"
            defaultChecked={initial?.namePending ?? false}
          />
          <span className="text-sm text-slate-700">Name not yet confirmed</span>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={initial?.notes ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Emergency backup, contact info, etc."
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark disabled:opacity-60"
        >
          {isPending ? 'Saving…' : initial ? 'Save changes' : 'Add to roster'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
