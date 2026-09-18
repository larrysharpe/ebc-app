import type { UserRole } from '@/modules/auth/types/auth.types';

export type NotificationChannel = 'email' | 'push' | 'sms';

export type NotificationDeliveryStatus =
  | 'pending'
  | 'sent'
  | 'skipped'
  | 'failed';

export type NotificationTopicGroup =
  | 'music'
  | 'visitors'
  | 'ministries'
  | 'account';

export type NotificationTopicId =
  | 'music.plan.shared'
  | 'music.plan.updated'
  | 'music.attendance.received'
  | 'music.comment.posted'
  | 'visitors.new'
  | 'ministry.event.reminder'
  | 'ministry.roster.attention'
  | 'ministry.sop.attention'
  | 'account.security';

export type NotificationTopicDefinition = {
  id: NotificationTopicId;
  group: NotificationTopicGroup;
  label: string;
  description: string;
  /** Roles that may receive this topic (and see it in settings). */
  audienceRoles: readonly UserRole[];
  /** When true, settings can toggle per assigned ministry. */
  ministryScoped: boolean;
  defaultEmail: boolean;
  defaultPush: boolean;
  defaultSms: boolean;
};

export type ChannelPreference = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
};

export type TopicPreference = {
  topic: NotificationTopicId;
  ministryId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
};

export type NotificationSettingsView = {
  channels: ChannelPreference;
  /** Topics available to this user given roles / ministries. */
  topics: Array<{
    definition: NotificationTopicDefinition;
    /** Global (ministryId "") preference for non-scoped or default. */
    preference: TopicPreference;
    /** Per-ministry rows when ministryScoped and user has assignments. */
    ministryPreferences: TopicPreference[];
  }>;
  delivery: {
    emailConfigured: boolean;
    pushConfigured: boolean;
    smsConfigured: boolean;
  };
};

export type NotifyInput = {
  topic: NotificationTopicId;
  title: string;
  /** Short summary (used for push/SMS; also email when emailBody is omitted). */
  body: string;
  /** Full message for email when longer than the push summary. */
  emailBody?: string;
  /** Optional SMS override; defaults to body (+ app link when href is set). */
  smsBody?: string;
  href?: string;
  actorUserId?: string;
  recipientUserIds?: readonly string[];
  /** Extra role filter when resolving audience from topic defaults. */
  roles?: readonly UserRole[];
  ministryId?: string;
  payload?: Record<string, unknown>;
};

export type NotifyResult = {
  recipientCount: number;
  queued: number;
  skipped: number;
  emailConfigured: boolean;
  pushConfigured: boolean;
  smsConfigured: boolean;
};
