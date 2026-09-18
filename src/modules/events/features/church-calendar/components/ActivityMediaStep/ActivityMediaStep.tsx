'use client';

import {
  ACTIVITY_MEDIA_FIELD_LABELS,
  ACTIVITY_MEDIA_FIELDS,
  ACTIVITY_MEDIA_STEP_MODE,
  type ActivityMediaField,
  type ActivityMediaStepMode,
} from '@/modules/events/constants/activity-request.constants';
import type { ActivityRequest } from '@/modules/events/types/activity-request.types';
import type { ChurchEventType } from '@/modules/events/types/church-event.types';

export type ActivityMediaStepProps = {
  eventType: ChurchEventType;
  value: ActivityRequest;
  onChange: (next: ActivityRequest) => void;
};

function modeIntro(mode: ActivityMediaStepMode): string {
  if (mode === 'confirm') {
    return 'Worship and special services usually need media. Look through the list — check what you need, or choose No media needed if you are sure.';
  }
  if (mode === 'optional') {
    return 'Classes and meetings often do not need media — but please look through the list so nothing is overlooked.';
  }
  return 'Look through the list carefully so nothing is overlooked. Check what you need, or choose No media needed.';
}

function hasAnyMediaItem(
  media: ActivityRequest['media'],
): boolean {
  return ACTIVITY_MEDIA_FIELDS.some((field) => media[field]);
}

export function ActivityMediaStep({
  eventType,
  value,
  onChange,
}: ActivityMediaStepProps): React.JSX.Element {
  const mode = ACTIVITY_MEDIA_STEP_MODE[eventType];
  const media = value.media;
  const noneSelected = media.noneConfirmed && !media.needed;

  function setMedia(partial: Partial<ActivityRequest['media']>): void {
    onChange({ ...value, media: { ...media, ...partial } });
  }

  function selectNoMediaNeeded(): void {
    setMedia({
      needed: false,
      noneConfirmed: true,
      sound: false,
      slides: false,
      livestream: false,
      camera: false,
      graphics: false,
      playback: false,
    });
  }

  function toggleField(field: ActivityMediaField, checked: boolean): void {
    const next = {
      ...media,
      [field]: checked,
      noneConfirmed: false,
    };
    const anySelected = ACTIVITY_MEDIA_FIELDS.some((key) =>
      key === field ? checked : next[key],
    );
    setMedia({
      ...next,
      needed: anySelected,
      noneConfirmed: false,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ebc-burgundy">
          Media checklist
        </h3>
        <p className="mt-2 text-sm text-slate-600">{modeIntro(mode)}</p>
      </div>

      <div className="grid gap-3">
        {ACTIVITY_MEDIA_FIELDS.map((field) => {
          const selected = media[field] && !noneSelected;
          return (
            <label
              key={field}
              className={`ebc-choice min-h-11 ${
                selected ? 'ebc-choice-selected' : 'ebc-choice-idle'
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => toggleField(field, e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-slate-300"
              />
              <span className="text-sm font-medium">
                {ACTIVITY_MEDIA_FIELD_LABELS[field]}
              </span>
            </label>
          );
        })}
      </div>

      <button
        type="button"
        onClick={selectNoMediaNeeded}
        className={`ebc-choice min-h-11 w-full text-left ${
          noneSelected ? 'ebc-choice-selected' : 'ebc-choice-idle'
        }`}
      >
        <span className="block text-sm font-medium">No media needed</span>
        <span className="mt-0.5 block text-xs font-normal text-slate-500">
          I looked through the list and we do not need media help
        </span>
      </button>

      {media.needed && hasAnyMediaItem(media) ? (
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Media notes (optional)
          </span>
          <textarea
            value={media.notes ?? ''}
            onChange={(e) => setMedia({ notes: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
            placeholder="Anything the media team should know"
          />
        </label>
      ) : null}
    </div>
  );
}
