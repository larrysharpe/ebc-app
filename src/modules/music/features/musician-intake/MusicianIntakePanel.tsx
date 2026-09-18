'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  addIntakeToRosterAction,
  declineMusicianIntakeAction,
  deleteMusicianIntakeAction,
  saveMusicianIntakeAction,
} from '@/modules/music/actions/musician-intake.actions';
import {
  BAND_INSTRUMENT_LABELS,
  BAND_INSTRUMENT_ORDER,
  BAND_PLAYER_TYPE_LABELS,
} from '@/modules/music/types';
import type { BandInstrument, BandPlayerType } from '@/modules/music/types';
import type { MusicianIntake } from '@/modules/music/types/musician-intake.types';
import { MUSICIAN_INTAKE_STATUS_LABELS } from '@/modules/music/types/musician-intake.types';
import { formatServiceDate } from '@/modules/music/utils/music.format';

export type MusicianIntakePanelProps = {
  intakes: MusicianIntake[];
};

export function MusicianIntakePanel({ intakes }: MusicianIntakePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instrument, setInstrument] = useState<BandInstrument>('keys');
  const [serviceDate, setServiceDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [playerType, setPlayerType] = useState<BandPlayerType>('guest');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState('');

  function resetForm() {
    setName('');
    setEmail('');
    setPhone('');
    setInstrument('keys');
    setPlayerType('guest');
    setPaymentComplete(false);
    setPaymentNotes('');
  }

  function handleCreate() {
    setError(null);
    setOkMessage(null);
    startTransition(async () => {
      const result = await saveMusicianIntakeAction({
        name,
        email,
        phone,
        instrument,
        serviceDate,
        playerType,
        paymentPaperworkComplete: paymentComplete,
        paymentNotes: paymentNotes || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      resetForm();
      setOkMessage('Intake saved — replace the paper signup with this record.');
      router.refresh();
    });
  }

  function runAction(
    action: () => Promise<{ ok: boolean; error?: string }>,
    successMessage: string,
  ) {
    setError(null);
    setOkMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      setOkMessage(successMessage);
      router.refresh();
    });
  }

  const pending = intakes.filter((item) => item.status === 'pending');
  const others = intakes.filter((item) => item.status !== 'pending');

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {okMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {okMessage}
        </p>
      ) : null}

      <section className="ebc-card space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ebc-burgundy">Musician signup</h2>
          <p className="mt-1 text-sm text-slate-600">
            Digital replacement for the paper sheet — capture who played, contact info, and
            that payment paperwork was completed. Dollar amounts stay with finance / Realm,
            not here.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Musician name *</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Instrument</span>
            <select
              value={instrument}
              onChange={(event) => setInstrument(event.target.value as BandInstrument)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {BAND_INSTRUMENT_ORDER.map((item) => (
                <option key={item} value={item}>
                  {BAND_INSTRUMENT_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Service date</span>
            <input
              type="date"
              value={serviceDate}
              onChange={(event) => setServiceDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              value={playerType}
              onChange={(event) => setPlayerType(event.target.value as BandPlayerType)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {(Object.keys(BAND_PLAYER_TYPE_LABELS) as BandPlayerType[]).map((type) => (
                <option key={type} value={type}>
                  {BAND_PLAYER_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              Ops note (no dollar amounts)
            </span>
            <input
              value={paymentNotes}
              onChange={(event) => setPaymentNotes(event.target.value)}
              placeholder="e.g. Forms given to finance"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={paymentComplete}
              onChange={(event) => setPaymentComplete(event.target.checked)}
            />
            Payment paperwork completed (signed / forms submitted)
          </label>
        </div>

        <button
          type="button"
          disabled={isPending || !name.trim()}
          onClick={handleCreate}
          className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy/90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save signup'}
        </button>
      </section>

      <section className="ebc-card space-y-3">
        <h2 className="text-lg font-bold text-ebc-burgundy">Pending intake</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">No pending signups.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((intake) => (
              <li
                key={intake.id}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{intake.name}</p>
                    <p className="mt-1 text-slate-600">
                      {BAND_INSTRUMENT_LABELS[intake.instrument]} ·{' '}
                      {BAND_PLAYER_TYPE_LABELS[intake.playerType]} ·{' '}
                      {formatServiceDate(intake.serviceDate)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Paperwork:{' '}
                      {intake.paymentPaperworkComplete ? 'Complete' : 'Not marked'}
                      {intake.paymentNotes ? ` · ${intake.paymentNotes}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          () => addIntakeToRosterAction({ id: intake.id }),
                          'Added to band roster.',
                        )
                      }
                      className="rounded-lg bg-ebc-burgundy px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Add to roster
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          () => declineMusicianIntakeAction({ id: intake.id }),
                          'Marked declined.',
                        )
                      }
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          () => deleteMusicianIntakeAction({ id: intake.id }),
                          'Deleted.',
                        )
                      }
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {others.length > 0 ? (
        <section className="ebc-card space-y-3">
          <h2 className="text-lg font-bold text-ebc-burgundy">Recent history</h2>
          <ul className="space-y-2 text-sm">
            {others.slice(0, 12).map((intake) => (
              <li
                key={intake.id}
                className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
              >
                <span>
                  <span className="font-medium text-slate-900">{intake.name}</span>
                  <span className="text-slate-500">
                    {' '}
                    · {formatServiceDate(intake.serviceDate)}
                  </span>
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {MUSICIAN_INTAKE_STATUS_LABELS[intake.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
