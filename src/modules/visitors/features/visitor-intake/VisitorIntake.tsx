'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  logVisitorAction,
  updateVisitorStatusAction,
} from '@/modules/visitors/actions/visitor.actions';
import type { Visitor, VisitorStatus } from '@/modules/visitors/types/visitor.types';
import { VISITOR_STATUS_LABELS } from '@/modules/visitors/types/visitor.types';

type VisitorIntakeProps = {
  visitors: Visitor[];
  showFormInitially?: boolean;
};

export function VisitorIntake({ visitors, showFormInitially = false }: VisitorIntakeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(showFormInitially);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      await logVisitorAction({
        firstName: String(formData.get('firstName') ?? ''),
        lastName: String(formData.get('lastName') ?? ''),
        email: String(formData.get('email') ?? '') || undefined,
        phone: String(formData.get('phone') ?? '') || undefined,
        visitDate: String(formData.get('visitDate') ?? ''),
        howHeard: String(formData.get('howHeard') ?? '') || undefined,
        followUpNotes: String(formData.get('followUpNotes') ?? '') || undefined,
      });
      setShowForm(false);
      router.refresh();
    });
  }

  function handleStatusChange(id: string, status: VisitorStatus) {
    startTransition(async () => {
      await updateVisitorStatusAction(id, status);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ebc-burgundy">Visitor follow-up</h2>
          <p className="mt-1 text-sm text-slate-600">
            Log first-time guests and track follow-up through connection. Only office, pastor,
            and assigned follow-up staff should see these records — not the whole church.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark"
        >
          {showForm ? 'Cancel' : 'Log visitor'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="ebc-card grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">First name *</span>
            <input name="firstName" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Last name *</span>
            <input name="lastName" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Visit date *</span>
            <input
              name="visitDate"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input name="phone" type="tel" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input name="email" type="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">How they heard about EBC</span>
            <input name="howHeard" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Follow-up notes</span>
            <textarea name="followUpNotes" rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white hover:bg-ebc-green-dark disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save visitor'}
            </button>
          </div>
        </form>
      ) : null}

      {visitors.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-500">
          No visitors logged yet. Use Log visitor to start follow-up tracking.
        </p>
      ) : (
        <div className="space-y-3">
          {visitors.map((visitor) => (
            <article key={visitor.id} className="ebc-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {visitor.firstName} {visitor.lastName}
                  </p>
                  <p className="text-sm text-ebc-burgundy">Visited {visitor.visitDate}</p>
                  {visitor.phone ? <p className="text-sm text-slate-600">{visitor.phone}</p> : null}
                  {visitor.email ? <p className="text-sm text-slate-600">{visitor.email}</p> : null}
                  {visitor.howHeard ? (
                    <p className="mt-2 text-sm text-slate-500">Heard via: {visitor.howHeard}</p>
                  ) : null}
                  {visitor.followUpNotes ? (
                    <p className="mt-2 text-sm text-slate-600">{visitor.followUpNotes}</p>
                  ) : null}
                </div>
                <label className="block">
                  <span className="sr-only">Follow-up status</span>
                  <select
                    value={visitor.status}
                    onChange={(event) =>
                      handleStatusChange(visitor.id, event.target.value as VisitorStatus)
                    }
                    disabled={isPending}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {(Object.keys(VISITOR_STATUS_LABELS) as VisitorStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {VISITOR_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
