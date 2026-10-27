import { z } from 'zod';
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
      operation_id: z.uuid(),
      status: z.enum(['tentative', 'confirmed', 'completed', 'cancelled']),
      minimum_guests: z.number().int().nonnegative(),
      final_guests: z.number().int().nonnegative().nullable(),
      menu_price: z.string(),
      menu_name: z.string().nullable(),
      agreed_advance: z.string(),
      advance_due_at: z.string().nullable(),
      extra_services: z.array(
        z.object({ name: z.string(), amount: z.string() }),
      ),
      staff: z.array(staffAssignmentSchema).optional(),
      notes: z.string(),
    }),
  requiresReconciliation: z.boolean().optional(),
});

export const bookingCreationJournalSchema = z.object({
  owner: z.string().min(1),
  savedAt: z.number().int().nonnegative(),
  attempt: bookingCreationAttemptSchema,
});
