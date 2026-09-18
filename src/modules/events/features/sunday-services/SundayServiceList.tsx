'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import {
  deleteSundayServiceAction,
  updateSundayServiceAction,
} from '@/modules/events/actions/sunday-service.actions';
import {
  formatServiceCharacteristics,
  formatServiceDisplayTitle,
  isSpecialSundayService,
  type SundayService,
} from '@/modules/events/types/sunday-service.types';

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export type SundayServiceListProps = {
  services: SundayService[];
  canManage: boolean;
};

export function SundayServiceList({ services, canManage }: SundayServiceListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (services.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
        No upcoming services yet. Add one so choir directors can select it when planning.
      </p>
    );
  }

  function cancelService(service: SundayService) {
    startTransition(async () => {
      await updateSundayServiceAction(service.id, {
        serviceDate: service.serviceDate,
        title: service.title,
        characteristics: service.characteristics,
        notes: service.notes,
        startTime: service.startTime,
        endTime: service.endTime,
        status: 'cancelled',
      });
      router.refresh();
    });
  }

  function removeService(id: string) {
    startTransition(async () => {
      await deleteSundayServiceAction(id);
      router.refresh();
    });
  }

  return (
    <ul className="space-y-3">
      {services.map((service) => {
        const special = isSpecialSundayService(service);
        return (
          <li
            key={service.id}
            className={`rounded-xl border bg-white px-4 py-4 ${
              special ? 'border-amber-200' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {formatDate(service.serviceDate)}
                  {service.startTime
                    ? ` · ${service.startTime}${service.endTime ? `–${service.endTime}` : ''}`
                    : ''}
                </p>
                <h3 className="mt-1 font-semibold text-slate-900">
                  {formatServiceDisplayTitle(service)}
                </h3>
                {special ? (
                  <p className="mt-1 text-sm font-medium text-amber-900">
                    {formatServiceCharacteristics(service.characteristics)}
                  </p>
                ) : service.title.trim() ? null : (
                  <p className="mt-1 text-sm text-slate-500">Worship service</p>
                )}
                {service.notes ? (
                  <p className="mt-2 text-sm text-slate-600">{service.notes}</p>
                ) : null}
                {service.status === 'cancelled' ? (
                  <p className="mt-2 text-xs font-semibold uppercase text-red-700">
                    Cancelled
                  </p>
                ) : null}
              </div>
              {canManage && service.status === 'scheduled' ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => cancelService(service)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => removeService(service.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
