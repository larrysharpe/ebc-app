'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactElement } from 'react';

import {
  updateChannelPreferenceAction,
  updateTopicPreferenceAction,
} from '@/modules/notifications/actions/notification-preferences.actions';
import { NOTIFICATION_TOPIC_GROUPS } from '@/modules/notifications/constants/notification-topics.constants';
import type { NotificationSettingsView } from '@/modules/notifications/types/notification.types';
import { ministryLabel } from '@/modules/notifications/utils/notification-preferences.utils';

export type NotificationSettingsProps = {
  settings: NotificationSettingsView;
  ministryOptions: { id: string; name: string }[];
};

function ToggleRow({
  label,
  description,
  emailEnabled,
  pushEnabled,
  smsEnabled,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  disabled?: boolean;
  onChange: (next: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  }) => void;
}): ReactElement {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
      <div className="min-w-0">
        <p className="text-base font-semibold text-slate-900">{label}</p>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="ebc-choice ebc-choice-idle">
          <input
            type="checkbox"
            className="h-5 w-5 accent-ebc-burgundy"
            checked={emailEnabled}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                emailEnabled: event.target.checked,
                pushEnabled,
                smsEnabled,
              })
            }
          />
          Email
        </label>
        <label className="ebc-choice ebc-choice-idle">
          <input
            type="checkbox"
            className="h-5 w-5 accent-ebc-burgundy"
            checked={pushEnabled}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                emailEnabled,
                pushEnabled: event.target.checked,
                smsEnabled,
              })
            }
          />
          App alert
        </label>
        <label className="ebc-choice ebc-choice-idle">
          <input
            type="checkbox"
            className="h-5 w-5 accent-ebc-burgundy"
            checked={smsEnabled}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                emailEnabled,
                pushEnabled,
                smsEnabled: event.target.checked,
              })
            }
          />
          Text
        </label>
      </div>
    </div>
  );
}

export function NotificationSettings({
  settings,
  ministryOptions,
}: NotificationSettingsProps): ReactElement {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [channels, setChannels] = useState(settings.channels);

  function saveChannels(next: typeof channels): void {
    setChannels(next);
    setError(null);
    startTransition(async () => {
      const result = await updateChannelPreferenceAction(next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function saveTopic(input: {
    topic: string;
    ministryId?: string;
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  }): void {
    setError(null);
    startTransition(async () => {
      const result = await updateTopicPreferenceAction(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="ebc-card">
        <h2 className="text-lg font-bold text-ebc-burgundy">How we reach you</h2>
        <p className="mt-2 text-base text-slate-600">
          Choose email, app alerts, and text messages for the work you do. You
          can turn whole channels off, or fine-tune by topic
          {ministryOptions.length > 0 ? ' and ministry' : ''}. Text uses the
          phone number on your directory profile (matched by email).
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>
            Email delivery:{' '}
            <span className="font-medium text-slate-900">
              {settings.delivery.emailConfigured
                ? 'Ready (SMTP configured)'
                : 'Queued until SMTP is configured'}
            </span>
          </li>
          <li>
            App alerts:{' '}
            <span className="font-medium text-slate-900">
              {settings.delivery.pushConfigured
                ? 'Ready (push configured)'
                : 'Queued until app push is configured'}
            </span>
          </li>
          <li>
            Text messages:{' '}
            <span className="font-medium text-slate-900">
              {settings.delivery.smsConfigured
                ? 'Ready (Twilio configured)'
                : 'Queued until Twilio is configured'}
            </span>
          </li>
        </ul>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-ebc-burgundy">Channels</h2>
        <ToggleRow
          label="Master switches"
          description="Turn email, app alerts, or text off for everything below."
          emailEnabled={channels.emailEnabled}
          pushEnabled={channels.pushEnabled}
          smsEnabled={channels.smsEnabled}
          disabled={pending}
          onChange={saveChannels}
        />
      </section>

      {NOTIFICATION_TOPIC_GROUPS.map((group) => {
        const groupTopics = settings.topics.filter(
          (item) => item.definition.group === group.id,
        );
        if (groupTopics.length === 0) return null;

        return (
          <section key={group.id} className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-ebc-burgundy">{group.label}</h2>
              <p className="mt-1 text-sm text-slate-600">{group.description}</p>
            </div>
            {groupTopics.map((item) => (
              <div key={item.definition.id} className="space-y-3">
                <ToggleRow
                  label={item.definition.label}
                  description={item.definition.description}
                  emailEnabled={item.preference.emailEnabled}
                  pushEnabled={item.preference.pushEnabled}
                  smsEnabled={item.preference.smsEnabled}
                  disabled={pending}
                  onChange={(next) =>
                    saveTopic({
                      topic: item.definition.id,
                      ministryId: '',
                      ...next,
                    })
                  }
                />
                {item.definition.ministryScoped &&
                item.ministryPreferences.length > 0 ? (
                  <div className="space-y-3 border-l-2 border-ebc-burgundy/20 pl-3 sm:pl-4">
                    <p className="text-sm font-medium text-slate-700">
                      Per ministry
                    </p>
                    {item.ministryPreferences.map((pref) => {
                      const name =
                        ministryOptions.find((m) => m.id === pref.ministryId)
                          ?.name ?? ministryLabel(pref.ministryId);
                      return (
                        <ToggleRow
                          key={`${item.definition.id}-${pref.ministryId}`}
                          label={name}
                          emailEnabled={pref.emailEnabled}
                          pushEnabled={pref.pushEnabled}
                          smsEnabled={pref.smsEnabled}
                          disabled={pending}
                          onChange={(next) =>
                            saveTopic({
                              topic: item.definition.id,
                              ministryId: pref.ministryId,
                              ...next,
                            })
                          }
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
