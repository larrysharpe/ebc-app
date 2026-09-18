import { z } from 'zod';

const bandInstrumentSchema = z.enum(['keys', 'drums', 'violin', 'bass', 'congas']);
const musicianRoleSchema = z.enum([
  'primary',
  'every_other',
  'backup',
  'emergency',
  'song_fill',
  'special',
]);
const playerTypeSchema = z.enum(['regular', 'guest']);
const sundaySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const bandMusicianInputSchema = z
  .object({
    id: z.string().trim().optional(),
    name: z.string().trim().min(1, 'Name is required'),
    personId: z.string().trim().min(1).optional(),
    instrument: bandInstrumentSchema,
    secondaryInstruments: z.array(bandInstrumentSchema).default([]),
    playerType: playerTypeSchema,
    guestServiceDate: z.string().trim().optional(),
    sundays: z.array(sundaySchema).optional(),
    everyOther2nd: z.boolean().optional(),
    role: musicianRoleSchema,
    depthOrder: z.number().int().min(0).max(99).default(0),
    namePending: z.boolean().optional(),
    notes: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.playerType === 'guest' && !value.guestServiceDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Guest players need a service date',
        path: ['guestServiceDate'],
      });
    }
    if (value.secondaryInstruments.includes(value.instrument)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Secondary instruments cannot include the primary instrument.',
        path: ['secondaryInstruments'],
      });
    }
  });

export type BandMusicianInput = z.infer<typeof bandMusicianInputSchema>;

export const bandMusicianIdSchema = z.object({
  id: z.string().trim().min(1),
});
