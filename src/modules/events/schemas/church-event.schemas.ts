import { z } from 'zod';

import { EVENT_RECURRENCE_PATTERNS } from '../constants/event-recurrence.constants';
import { CHURCH_EVENT_TYPES } from '../types/church-event.types';

const eventTypeSchema = z.enum(
  CHURCH_EVENT_TYPES as unknown as [string, ...string[]],
);
const recurrencePatternSchema = z.enum(
  EVENT_RECURRENCE_PATTERNS as unknown as [string, ...string[]],
);
const leadTimeTierSchema = z.enum(['plenty', 'ok', 'short', 'emergency']);
const helpFromSchema = z.enum([
  'ushers',
  'trustees',
  'communications',
  'other_ministries',
]);
const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Use HH:MM time format')
  .optional()
  .or(z.literal(''));

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD date format')
  .optional()
  .or(z.literal(''));

export const activityMediaNeedsSchema = z.object({
  needed: z.boolean(),
  noneConfirmed: z.boolean().default(false),
  sound: z.boolean(),
  slides: z.boolean(),
  livestream: z.boolean(),
  camera: z.boolean(),
  graphics: z.boolean(),
  playback: z.boolean().default(false),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const activityKitchenNeedsSchema = z.object({
  needed: z.boolean(),
  noneConfirmed: z.boolean().default(false),
  heatingCooking: z.boolean().default(false),
  utensils: z.boolean().default(false),
  plates: z.boolean().default(false),
  cupsGlasses: z.boolean().default(false),
  napkinsTableCloths: z.boolean().default(false),
  coffee: z.boolean().default(false),
  refrigeration: z.boolean().default(false),
  freezer: z.boolean().default(false),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const activityFloorPlanNeedsSchema = z.object({
  needed: z.boolean(),
  noneConfirmed: z.boolean().default(false),
  theaterSeating: z.number().int().min(0).max(500).default(0),
  roundTables: z.number().int().min(0).max(500).default(0),
  classroomSeating: z.number().int().min(0).max(500).default(0),
  podium: z.number().int().min(0).max(500).default(0),
  registrationTable: z.number().int().min(0).max(500).default(0),
  servingTables: z.number().int().min(0).max(500).default(0),
  clearFloor: z.number().int().min(0).max(1).default(0),
  accessibilitySeating: z.number().int().min(0).max(500).default(0),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const activityCoordinationSchema = z.object({
  bulletin: z.boolean(),
  otherChurches: z.boolean(),
  flyerCopies: z.boolean(),
  financialVoucher: z.boolean(),
  helpFrom: z.array(helpFromSchema).max(8),
});

export const activityAcknowledgementsSchema = z.object({
  cleanRoom: z.boolean(),
  noBannersWithoutPermission: z.boolean(),
  conflictMayReschedule: z.boolean(),
});

export const activityRequestSchema = z.object({
  contactName: z.string().trim().max(120).optional().or(z.literal('')),
  contactPhone: z.string().trim().max(40).optional().or(z.literal('')),
  participantsEstimate: z.number().int().min(0).max(5000).optional(),
  guestSpeaker: z.string().trim().max(160).optional().or(z.literal('')),
  kitchen: activityKitchenNeedsSchema,
  media: activityMediaNeedsSchema,
  floorPlan: activityFloorPlanNeedsSchema,
  coordination: activityCoordinationSchema,
  acknowledgements: activityAcknowledgementsSchema,
  leadTimeTier: leadTimeTierSchema.optional(),
  emergencyReason: z.string().trim().max(500).optional().or(z.literal('')),
  willContactOffice: z.boolean().optional(),
  submittedAt: z.string().datetime().optional(),
  approvedByUserId: z.string().trim().max(80).optional(),
  approvedAt: z.string().datetime().optional(),
  returnedAt: z.string().datetime().optional(),
  returnReason: z.string().trim().max(500).optional().or(z.literal('')),
});

export type ActivityRequestInput = z.infer<typeof activityRequestSchema>;

export const churchEventInputSchema = z
  .object({
    /** Empty / omitted = date TBD (planning draft). */
    eventDate: optionalDate,
    title: z.string().trim().max(160).optional().or(z.literal('')),
    startTime: timeString,
    endTime: timeString,
    location: z.string().trim().max(200).optional().or(z.literal('')),
    /** Church room id; empty = offsite/other or unset. */
    spaceId: z.string().trim().max(80).optional().or(z.literal('')),
    notes: z.string().trim().max(2000).optional().or(z.literal('')),
    /** Optional custom label override; usually derived from recurrencePattern. */
    recurring: z.string().trim().max(160).optional().or(z.literal('')),
    recurrencePattern: recurrencePatternSchema.default('none'),
    /** Inclusive end for generated occurrences (defaults server-side to ~90 days). */
    recurrenceUntil: optionalDate,
    /** For custom recurrence: 0=Sun … 6=Sat. */
    recurrenceWeekdays: z.array(z.number().int().min(0).max(6)).optional(),
    /** For custom recurrence: every N weeks. */
    recurrenceIntervalWeeks: z.number().int().min(1).max(12).optional(),
    eventType: eventTypeSchema.default('other'),
    status: z
      .enum(['draft', 'pending_approval', 'scheduled', 'cancelled'])
      .default('scheduled'),
    /** Empty / omitted = church-wide. */
    ministryId: z.string().trim().min(1).optional().or(z.literal('')),
    activityRequest: activityRequestSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.recurrencePattern !== 'none' && !value.eventDate?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['eventDate'],
        message: 'Pick a start date before setting a repeat pattern.',
      });
    }
    if (
      value.recurrencePattern === 'custom' &&
      (!value.recurrenceWeekdays || value.recurrenceWeekdays.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['recurrenceWeekdays'],
        message: 'Pick at least one weekday for a custom repeat.',
      });
    }
    if (value.status === 'pending_approval' && value.activityRequest) {
      const ack = value.activityRequest.acknowledgements;
      if (
        !ack.cleanRoom ||
        !ack.noBannersWithoutPermission ||
        !ack.conflictMayReschedule
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['activityRequest', 'acknowledgements'],
          message: 'Please confirm the activity acknowledgements before submitting.',
        });
      }
      if (
        value.activityRequest.leadTimeTier === 'emergency' &&
        !value.activityRequest.emergencyReason?.trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['activityRequest', 'emergencyReason'],
          message: 'Add a short reason for this emergency request.',
        });
      }
      if (
        value.activityRequest.leadTimeTier === 'emergency' &&
        !value.activityRequest.willContactOffice
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['activityRequest', 'willContactOffice'],
          message: 'Confirm that you will contact the office.',
        });
      }
    }
  });

export type ChurchEventInput = z.infer<typeof churchEventInputSchema>;
