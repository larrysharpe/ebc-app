'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Drawer } from '@/components/ui/Drawer';
import { useToast } from '@/components/ui/Toast';
import type { Person } from '@/modules/members/types/person.types';
import { deleteBandMusicianAction } from '@/modules/music/actions/band-roster.actions';
import type { BandMusician, BandPlayerType } from '@/modules/music/types';
import {
  BAND_INSTRUMENT_LABELS,
  BAND_INSTRUMENT_ORDER,
  BAND_PLAYER_TYPE_LABELS,
  MUSICIAN_ROLE_LABELS,
} from '@/modules/music/types';
import {
  compareDepthChart,
  formatMusicianInstruments,
  formatMusicianName,
  formatMusicianSchedule,
  getUpcomingGuests,
  splitBandRoster,
} from '@/modules/music/utils/band-roster.utils';
import { MusicianForm } from './MusicianForm';

export type BandRosterManagementProps = {
  roster: BandMusician[];
  people: Person[];
};

type EditorState =
  | { mode: 'closed' }
  | { mode: 'create'; playerType: BandPlayerType }
  | { mode: 'edit'; musician: BandMusician };

export function BandRosterManagement({ roster, people }: BandRosterManagementProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' });
  const { regular, guests } = splitBandRoster(roster);
  const upcomingGuests = getUpcomingGuests(roster);

  async function handleDelete(id: string, name: string): Promise<void> {
    const confirmed = await confirm({
      title: 'Remove from band roster?',
      description: `${name} will be removed from the depth chart.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (!confirmed) return;

    startTransition(async () => {
      await deleteBandMusicianAction(id);
      toast({ title: 'Removed from roster', tone: 'success' });
      router.refresh();
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ebc-burgundy/20 bg-ebc-burgundy/5 px-5 py-4">
        <div>
          <h2 className="font-display text-lg text-ebc-burgundy">Band depth chart</h2>
          <p className="mt-1 text-sm text-slate-600">
            Primary and secondary instruments, chart roles, and Sunday rotation — plus guest
            players for specific services.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditor({ mode: 'create', playerType: 'regular' })}
            className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark"
          >
            Add musician
          </button>
          <button
            type="button"
            onClick={() => setEditor({ mode: 'create', playerType: 'guest' })}
            className="rounded-lg border border-ebc-burgundy px-4 py-2 text-sm font-medium text-ebc-burgundy hover:bg-white"
          >
            Add guest
          </button>
        </div>
      </div>

      <Drawer
        open={editor.mode !== 'closed'}
        title={
          editor.mode === 'edit'
            ? 'Edit musician'
            : editor.mode === 'create' && editor.playerType === 'guest'
              ? 'Add guest'
              : 'Add musician'
        }
        description="Update the depth chart without leaving this page."
        onClose={() => setEditor({ mode: 'closed' })}
        size="lg"
      >
        {editor.mode === 'create' ? (
          <MusicianForm
            people={people}
            defaultPlayerType={editor.playerType}
            onCancel={() => setEditor({ mode: 'closed' })}
            onSaved={() => {
              setEditor({ mode: 'closed' });
              toast({ title: 'Musician saved', tone: 'success' });
            }}
          />
        ) : null}
        {editor.mode === 'edit' ? (
          <MusicianForm
            people={people}
            initial={editor.musician}
            onCancel={() => setEditor({ mode: 'closed' })}
            onSaved={() => {
              setEditor({ mode: 'closed' });
              toast({ title: 'Musician updated', tone: 'success' });
            }}
          />
        ) : null}
      </Drawer>

      {upcomingGuests.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50">
          <div className="border-b border-amber-200 px-5 py-4">
            <h3 className="font-semibold text-amber-900">Upcoming guest players</h3>
            <p className="mt-1 text-sm text-amber-800/80">
              One-time or fill-in musicians scheduled for specific services.
            </p>
          </div>
          <ul className="divide-y divide-amber-200/80">
            {upcomingGuests.map((guest) => (
              <li
                key={guest.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {formatMusicianName(guest)}
                    <span className="ml-2 rounded bg-amber-200/80 px-2 py-0.5 text-xs font-semibold text-amber-900">
                      Guest
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {BAND_INSTRUMENT_LABELS[guest.instrument]} · {formatMusicianSchedule(guest)}
                  </p>
                  {guest.notes ? <p className="mt-1 text-sm text-slate-500">{guest.notes}</p> : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditor({ mode: 'edit', musician: guest })}
                    className="text-sm font-medium text-ebc-burgundy hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      void handleDelete(guest.id, guest.name);
                    }}
                    className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {guests.length > upcomingGuests.length ? (
        <p className="text-sm text-slate-500">
          {guests.length - upcomingGuests.length} past guest
          {guests.length - upcomingGuests.length === 1 ? '' : 's'} on record.
        </p>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold text-slate-900">Depth chart by instrument</h3>
          <p className="mt-1 text-sm text-slate-600">
            Sorted by role (Primary → Alternating → Backup → Emergency → Song fill-in →
            Special), then depth order. Song fill-in covers musicians who can play individual
            songs but are not yet full-service.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {BAND_INSTRUMENT_ORDER.map((instrument) => {
            const musicians = regular
              .filter((m) => m.instrument === instrument)
              .sort(compareDepthChart);
            if (musicians.length === 0) return null;

            return (
              <div key={instrument} className="px-5 py-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-ebc-gold">
                  {BAND_INSTRUMENT_LABELS[instrument]}
                </h4>
                <ul className="mt-3 space-y-3">
                  {musicians.map((musician, index) => (
                    <li
                      key={musician.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-3"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          <span className="mr-2 text-xs font-semibold text-slate-400">
                            #{index + 1}
                          </span>
                          {formatMusicianName(musician)}
                          <span className="ml-2 rounded bg-ebc-burgundy/10 px-2 py-0.5 text-xs font-medium text-ebc-burgundy">
                            {MUSICIAN_ROLE_LABELS[musician.role]}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatMusicianInstruments(musician)}
                        </p>
                        <p className="mt-1 text-sm text-ebc-burgundy">
                          {formatMusicianSchedule(musician)}
                        </p>
                        {musician.notes ? (
                          <p className="mt-1 text-sm text-slate-500">{musician.notes}</p>
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditor({ mode: 'edit', musician })}
                          className="text-sm font-medium text-ebc-burgundy hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            void handleDelete(musician.id, musician.name);
                          }}
                          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold text-slate-900">All guest players</h3>
          <p className="mt-1 text-sm text-slate-600">
            {BAND_PLAYER_TYPE_LABELS.guest} musicians including past services.
          </p>
        </div>
        {guests.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No guest players yet. Use &ldquo;Add guest&rdquo; when someone fills in for a service.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {guests.map((guest) => (
              <li
                key={guest.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{formatMusicianName(guest)}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatMusicianInstruments(guest)} · {formatMusicianSchedule(guest)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditor({ mode: 'edit', musician: guest })}
                    className="text-sm font-medium text-ebc-burgundy hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      void handleDelete(guest.id, guest.name);
                    }}
                    className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
