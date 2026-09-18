import { describe, expect, it } from 'vitest';

import {
  channelAllowed,
  defaultTopicPreference,
  resolveTopicPreference,
  topicVisibleToRoles,
  topicsForUser,
} from './notification-preferences.utils';
import { NOTIFICATION_TOPIC_DEFINITIONS } from '../constants/notification-topics.constants';

describe('notification preference utils', () => {
  it('shows music topics to choir members', () => {
    const topics = topicsForUser({
      roles: ['choir_member'],
      ministryIds: [],
    });
    expect(topics.map((topic) => topic.id)).toContain('music.plan.shared');
    expect(topics.map((topic) => topic.id)).not.toContain('visitors.new');
  });

  it('shows ministry-scoped topics only when ministries are assigned', () => {
    const without = topicsForUser({
      roles: ['ministry_leader'],
      ministryIds: [],
    });
    expect(without.some((topic) => topic.ministryScoped)).toBe(false);

    const withMinistry = topicsForUser({
      roles: ['ministry_leader'],
      ministryIds: ['min-youth'],
    });
    expect(withMinistry.some((topic) => topic.id === 'ministry.event.reminder')).toBe(
      true,
    );
  });

  it('resolves ministry override then global then defaults', () => {
    const stored = [
      {
        topic: 'ministry.event.reminder' as const,
        ministryId: '',
        emailEnabled: false,
        pushEnabled: true,
        smsEnabled: false,
      },
      {
        topic: 'ministry.event.reminder' as const,
        ministryId: 'min-youth',
        emailEnabled: true,
        pushEnabled: false,
        smsEnabled: true,
      },
    ];

    expect(
      resolveTopicPreference({
        topic: 'ministry.event.reminder',
        ministryId: 'min-youth',
        stored,
      }).emailEnabled,
    ).toBe(true);

    expect(
      resolveTopicPreference({
        topic: 'ministry.event.reminder',
        ministryId: 'min-media',
        stored,
      }).emailEnabled,
    ).toBe(false);

    expect(defaultTopicPreference('account.security').emailEnabled).toBe(true);
  });

  it('requires both channel and topic enabled', () => {
    expect(
      channelAllowed(
        { emailEnabled: true, pushEnabled: false, smsEnabled: true },
        defaultTopicPreference('music.plan.shared'),
        'email',
      ),
    ).toBe(true);
    expect(
      channelAllowed(
        { emailEnabled: true, pushEnabled: false, smsEnabled: true },
        defaultTopicPreference('music.plan.shared'),
        'push',
      ),
    ).toBe(false);
    expect(
      channelAllowed(
        { emailEnabled: true, pushEnabled: true, smsEnabled: true },
        defaultTopicPreference('music.plan.shared'),
        'sms',
      ),
    ).toBe(true);
    expect(
      channelAllowed(
        { emailEnabled: true, pushEnabled: true, smsEnabled: true },
        defaultTopicPreference('music.comment.posted'),
        'sms',
      ),
    ).toBe(false);
  });

  it('checks audience roles', () => {
    expect(
      topicVisibleToRoles(NOTIFICATION_TOPIC_DEFINITIONS['visitors.new'], [
        'office_staff',
      ]),
    ).toBe(true);
    expect(
      topicVisibleToRoles(NOTIFICATION_TOPIC_DEFINITIONS['visitors.new'], [
        'choir_member',
      ]),
    ).toBe(false);
  });
});
