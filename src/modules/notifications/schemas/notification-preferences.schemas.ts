import { z } from 'zod';

const topicSchema = z.enum([
  'music.plan.shared',
  'music.plan.updated',
  'music.attendance.received',
  'music.comment.posted',
  'visitors.new',
  'ministry.event.reminder',
  'ministry.roster.attention',
  'ministry.sop.attention',
  'account.security',
]);

export const updateChannelPreferenceSchema = z.object({
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  smsEnabled: z.boolean(),
});

export const updateTopicPreferenceSchema = z.object({
  topic: topicSchema,
  ministryId: z.string().max(80).optional().default(''),
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  smsEnabled: z.boolean(),
});

export type UpdateChannelPreferenceInput = z.infer<
  typeof updateChannelPreferenceSchema
>;
export type UpdateTopicPreferenceInput = z.infer<
  typeof updateTopicPreferenceSchema
>;
