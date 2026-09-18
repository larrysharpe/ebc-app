'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';

import { listChurchSpaceOptionsAction } from '@/modules/facilities/actions/church-space.actions';
import {
  CHURCH_FLOOR_LABELS,
  CHURCH_FLOORS,
  OTHER_LOCATION_VALUE,
} from '@/modules/facilities/constants/church-space.constants';
import type { ChurchSpaceOption } from '@/modules/facilities/types/church-space.types';
import {
  findSpaceOptionByLocation,
  groupSpacesByFloor,
} from '@/modules/facilities/utils/church-space.utils';

export type ChurchSpaceSelection = {
  location: string;
  /** Set when an on-campus room is chosen; omitted for offsite/other. */
  spaceId?: string;
};

export type ChurchSpaceSelectProps = {
  value: string;
  spaceId?: string;
  onChange: (next: ChurchSpaceSelection) => void;
  label?: string;
  optional?: boolean;
  disabled?: boolean;
  /** When false, hides “Offsite / other…” (use with a separate place search). */
  allowOther?: boolean;
  /** Prefetched options — skips the client fetch when provided. */
  spaces?: readonly ChurchSpaceOption[];
  className?: string;
  selectClassName?: string;
};

export function ChurchSpaceSelect({
  value,
  spaceId,
  onChange,
  label = 'Location',
  optional = false,
  disabled = false,
  allowOther = true,
  spaces: spacesProp,
  className,
  selectClassName = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm',
}: ChurchSpaceSelectProps): ReactElement {
  const [loadedSpaces, setLoadedSpaces] = useState<ChurchSpaceOption[]>([]);
  const [loading, setLoading] = useState(!spacesProp);
  const [otherMode, setOtherMode] = useState(false);

  useEffect(() => {
    if (spacesProp) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void listChurchSpaceOptionsAction().then((options) => {
      if (cancelled) return;
      setLoadedSpaces(options);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [spacesProp]);

  const spaces = spacesProp ?? loadedSpaces;
  const matchedById = spaceId
    ? spaces.find((option) => option.id === spaceId)
    : undefined;
  const matched =
    matchedById ?? findSpaceOptionByLocation(value, spaces);

  useEffect(() => {
    if (matched) {
      setOtherMode(false);
      return;
    }
    if (value.trim()) {
      setOtherMode(true);
    }
  }, [matched, value]);

  const selectValue = matched
    ? matched.id
    : allowOther && otherMode
      ? OTHER_LOCATION_VALUE
      : '';
  const showOther = allowOther && selectValue === OTHER_LOCATION_VALUE;
  const grouped = useMemo(() => groupSpacesByFloor(spaces), [spaces]);

  return (
    <div className={className}>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          {label}
          {optional ? ' (optional)' : ''}
        </span>
        <select
          value={selectValue}
          disabled={disabled || loading}
          onChange={(event) => {
            const next = event.target.value;
            if (!next) {
              setOtherMode(false);
              onChange({ location: '' });
              return;
            }
            if (next === OTHER_LOCATION_VALUE) {
              if (!allowOther) return;
              setOtherMode(true);
              onChange({ location: matched ? '' : value });
              return;
            }
            setOtherMode(false);
            const space = spaces.find((option) => option.id === next);
            onChange({
              location: space?.label ?? '',
              spaceId: space?.id,
            });
          }}
          className={selectClassName}
        >
          <option value="">{loading ? 'Loading spaces…' : 'Select a room…'}</option>
          {CHURCH_FLOORS.map((floor) => {
            const floorSpaces = grouped[floor];
            if (floorSpaces.length === 0) return null;
            return (
              <optgroup key={floor} label={CHURCH_FLOOR_LABELS[floor]}>
                {floorSpaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
          {allowOther ? (
            <option value={OTHER_LOCATION_VALUE}>Offsite / other…</option>
          ) : null}
        </select>
      </label>
      {showOther ? (
        <label className="mt-2 block">
          <span className="text-xs font-medium text-slate-600">Other location</span>
          <input
            type="text"
            value={value}
            disabled={disabled}
            onChange={(event) => onChange({ location: event.target.value })}
            placeholder="Address or room name"
            className={selectClassName}
          />
        </label>
      ) : null}
    </div>
  );
}
