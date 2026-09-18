import { z } from 'zod';

export const MUSIC_MANAGEABLE_ROLES = [
  'choir_director',
  'choir_member',
  'band_director',
  'band_member',
] as const;

export const musicPeopleRoleSchema = z.enum(MUSIC_MANAGEABLE_ROLES);

export type MusicManageableRole = z.infer<typeof musicPeopleRoleSchema>;

export const choirRosterRoleSchema = z.enum(['singer', 'soloist', 'band']);

export const assignMusicRoleSchema = z.object({
  personId: z.string().trim().min(1, 'Pick someone from the directory.'),
  role: musicPeopleRoleSchema,
});

export const removeMusicRoleSchema = z.object({
  personId: z.string().trim().min(1),
  role: musicPeopleRoleSchema,
});

export const addChoirRosterMemberSchema = z.object({
  choirId: z.string().trim().min(1),
  personId: z.string().trim().min(1, 'Pick someone from the directory.'),
  role: choirRosterRoleSchema.default('singer'),
});

export const removeChoirRosterMemberSchema = z.object({
  choirId: z.string().trim().min(1),
  personId: z.string().trim().min(1),
});

export type AssignMusicRoleInput = z.infer<typeof assignMusicRoleSchema>;
export type RemoveMusicRoleInput = z.infer<typeof removeMusicRoleSchema>;
export type AddChoirRosterMemberInput = z.infer<typeof addChoirRosterMemberSchema>;
export type RemoveChoirRosterMemberInput = z.infer<
  typeof removeChoirRosterMemberSchema
>;
