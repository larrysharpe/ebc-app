import { MUSIC_MODULE_ROLES } from '@/modules/auth/constants/permissions.constants';
import type { UserRole } from '@/modules/auth/types/auth.types';

import type {
  NotificationTopicDefinition,
  NotificationTopicGroup,
  NotificationTopicId,
} from '../types/notification.types';

const OFFICE_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'webmaster',
  'pastor',
  'office_staff',
];

const MUSIC_LEADER_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'webmaster',
  'pastor',
  'music_minister',
  'choir_director',
];

const MINISTRY_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'webmaster',
  'pastor',
  'office_staff',
  'ministry_leader',
];

export const NOTIFICATION_TOPIC_DEFINITIONS: Record<
  NotificationTopicId,
  NotificationTopicDefinition
> = {
  'music.plan.shared': {
    id: 'music.plan.shared',
    group: 'music',
    label: 'New choir plan shared',
    description: 'When a director shares a Sunday plan with the choir.',
    audienceRoles: [...MUSIC_MODULE_ROLES, 'pastor', 'super_admin', 'admin', 'webmaster'],
    ministryScoped: false,
    defaultEmail: true,
    defaultPush: true,
    defaultSms: true,
  },
  'music.plan.updated': {
    id: 'music.plan.updated',
    group: 'music',
    label: 'Choir plan updates',
    description: 'When a shared plan’s songs or details change.',
    audienceRoles: [...MUSIC_MODULE_ROLES, 'pastor', 'super_admin', 'admin', 'webmaster'],
    ministryScoped: false,
    defaultEmail: true,
    defaultPush: true,
    defaultSms: true,
  },
  'music.attendance.received': {
    id: 'music.attendance.received',
    group: 'music',
    label: 'Attendance answers',
    description: 'When someone says if they can make Sunday.',
    audienceRoles: MUSIC_LEADER_ROLES,
    ministryScoped: false,
    defaultEmail: true,
    defaultPush: true,
    defaultSms: false,
  },
  'music.comment.posted': {
    id: 'music.comment.posted',
    group: 'music',
    label: 'Choir plan comments',
    description: 'When someone posts a comment on a shared plan.',
    audienceRoles: MUSIC_LEADER_ROLES,
    ministryScoped: false,
    defaultEmail: true,
    defaultPush: true,
    defaultSms: false,
  },
  'visitors.new': {
    id: 'visitors.new',
    group: 'visitors',
    label: 'New visitors',
    description: 'When a first-time guest is logged for follow-up.',
    audienceRoles: OFFICE_ROLES,
    ministryScoped: false,
    defaultEmail: true,
    defaultPush: true,
    defaultSms: false,
  },
  'ministry.event.reminder': {
    id: 'ministry.event.reminder',
    group: 'ministries',
    label: 'Ministry event reminders',
    description: 'Reminders for upcoming events on ministries you lead.',
    audienceRoles: MINISTRY_ROLES,
    ministryScoped: true,
    defaultEmail: true,
    defaultPush: true,
    defaultSms: false,
  },
  'ministry.roster.attention': {
    id: 'ministry.roster.attention',
    group: 'ministries',
    label: 'Roster needs attention',
    description: 'Open roles or empty rosters on your ministries.',
    audienceRoles: MINISTRY_ROLES,
    ministryScoped: true,
    defaultEmail: true,
    defaultPush: false,
    defaultSms: false,
  },
  'ministry.sop.attention': {
    id: 'ministry.sop.attention',
    group: 'ministries',
    label: 'SOP needs attention',
    description: 'When a ministry SOP is below the quality bar.',
    audienceRoles: MINISTRY_ROLES,
    ministryScoped: true,
    defaultEmail: true,
    defaultPush: false,
    defaultSms: false,
  },
  'account.security': {
    id: 'account.security',
    group: 'account',
    label: 'Account & sign-in',
    description: 'Important account notices (password resets, new device sign-in).',
    audienceRoles: [
      'super_admin',
      'admin',
      'webmaster',
      'pastor',
      'office_staff',
      'finance',
      'trustee',
      'deacon',
      ...MUSIC_MODULE_ROLES,
      'social_manager',
      'ministry_leader',
      'volunteer',
    ],
    ministryScoped: false,
    defaultEmail: true,
    defaultPush: false,
    defaultSms: false,
  },
};

export const NOTIFICATION_TOPIC_GROUPS: {
  id: NotificationTopicGroup;
  label: string;
  description: string;
}[] = [
  {
    id: 'music',
    label: 'Music & choir',
    description: 'Plans, attendance, and comments for Sunday music.',
  },
  {
    id: 'visitors',
    label: 'Visitors',
    description: 'Guest follow-up for office and pastoral care.',
  },
  {
    id: 'ministries',
    label: 'My ministries',
    description: 'Events, roster, and SOP alerts for teams you lead.',
  },
  {
    id: 'account',
    label: 'Account',
    description: 'Sign-in and security notices for your login.',
  },
];

export const ALL_NOTIFICATION_TOPIC_IDS = Object.keys(
  NOTIFICATION_TOPIC_DEFINITIONS,
) as NotificationTopicId[];
