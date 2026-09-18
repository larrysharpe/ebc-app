'use client';

import { useState } from 'react';

import {
  isPlanServiceRoleNa,
  PLAN_SERVICE_ROLE_NA,
} from '@/modules/music/utils/plan-service-role.utils';

export type PlanServiceRoleFieldProps = {
  name: string;
  label: string;
  /** Uncontrolled (form submit) mode. */
  defaultValue?: string | null;
  /** Controlled mode — used by the new-plan wizard. */
  value?: string;
  onChange?: (value: string) => void;
};

export function PlanServiceRoleField({
  name,
  label,
  defaultValue,
  value,
  onChange,
}: PlanServiceRoleFieldProps) {
  const controlled = typeof onChange === 'function';
  const initialNa = isPlanServiceRoleNa(controlled ? value : defaultValue);
  const [uncontrolledNa, setUncontrolledNa] = useState(initialNa);
  const [uncontrolledText, setUncontrolledText] = useState(
    initialNa ? '' : ((controlled ? value : defaultValue)?.trim() ?? ''),
  );

  const isNa = controlled ? isPlanServiceRoleNa(value) : uncontrolledNa;
  const text = controlled
    ? isNa
      ? ''
      : (value?.trim() ?? '')
    : uncontrolledText;

  function setNa(next: boolean) {
    if (controlled) {
      onChange?.(next ? PLAN_SERVICE_ROLE_NA : '');
      return;
    }
    setUncontrolledNa(next);
    if (next) setUncontrolledText('');
  }

  function setText(next: string) {
    if (controlled) {
      onChange?.(next);
      return;
    }
    setUncontrolledText(next);
  }

  return (
    <div className="block space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isNa}
            onChange={(event) => setNa(event.target.checked)}
          />
          N/A
        </label>
      </div>
      {isNa && !controlled ? (
        <input type="hidden" name={name} value={PLAN_SERVICE_ROLE_NA} />
      ) : null}
      <input
        name={controlled || isNa ? undefined : name}
        value={isNa ? PLAN_SERVICE_ROLE_NA : text}
        disabled={isNa}
        onChange={(event) => setText(event.target.value)}
        placeholder={isNa ? 'Not applicable' : 'Name or leave blank'}
        className="mt-0 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}
