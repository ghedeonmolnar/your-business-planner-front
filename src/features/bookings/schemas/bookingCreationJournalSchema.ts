import { z } from 'zod';
import { BOOKING_SERVICE_PRICING_TYPES } from '@/features/bookings/types';
import {
  bookingSchema,
  staffAssignmentSchema,
} from '@/features/bookings/schemas/bookingApiSchemas';
import { bookingFormSchema } from '@/features/bookings/schemas/bookingFormSchema';

export const bookingCreationAttemptSchema = z.object({
  values: z.object(bookingFormSchema.shape),
  payload: bookingSchema
    .pick({
      hall_id: true,
      client_id: true,
      date: true,
      type: true,
      starts_at: true,
      ends_at: true,
      expires_at: true,
    })
    .extend({
      client_id: z.string().optional(),
      client_phone: z
        .string()
        .regex(/^\+[1-9][0-9]{7,14}$/)
        .optional(),
      client_name: z.string().max(255).optional(),
      operation_id: z.uuid(),
      status: z.enum(['tentative', 'confirmed', 'completed', 'cancelled']),
      minimum_guests: z.number().int().nonnegative(),
      estimated_guests: z.number().int().nonnegative().nullable().optional(),
      child_guests: z.number().int().nonnegative().nullable().optional(),
      child_menu_price: z.string().optional(),
      final_guests: z.number().int().nonnegative().nullable(),
      menu_price: z.string(),
      menu_name: z.string().nullable(),
      agreed_advance: z.string(),
      advance_due_at: z.string().nullable(),
      advance_receipt: z
        .object({
          operation_id: z.uuid(),
          amount: z.string(),
          method: z.enum(['cash', 'card', 'transfer']),
          paid_at: z.iso.date(),
        })
        .optional(),
      extra_services: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
          pricing_type: z.enum(BOOKING_SERVICE_PRICING_TYPES).optional(),
        }),
      ),
      staff: z.array(staffAssignmentSchema).optional(),
      notes: z.string(),
    })
    .refine(
      payload => Boolean(payload.client_id) !== Boolean(payload.client_phone),
    ),
  requiresReconciliation: z.boolean().optional(),
});

export const bookingCreationJournalSchema = z.object({
  owner: z.string().min(1),
  savedAt: z.number().int().nonnegative(),
  attempt: bookingCreationAttemptSchema,
});
