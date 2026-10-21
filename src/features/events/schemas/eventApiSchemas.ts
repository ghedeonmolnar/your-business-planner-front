import { z } from 'zod';
import {
  MAX_OVERTIME_HOURS,
  MINUTES_PER_HOUR,
} from '@/features/events/schemas/paymentOvertimeSchema';
import { mapLocationSchema } from '@/shared/schemas/mapLocationSchema';
import {
  AvailabilitySummary,
  Event,
  EventDocument,
  EventPayment,
  EventReview,
  ReviewNotification,
} from '@/features/events/types';
import { employeeSchema } from '@/features/employees/schemas/employeeApiSchemas';
import { mascotSchema } from '@/features/mascots/schemas/mascotApiSchemas';

const eventStatusSchema = z.enum([
  'partial_details',
  'confirmed',
  'completed',
  'cancelled',
]);

const eventAssignmentSchema = z.object({
  mascot_id: z.string().min(1),
  employee_id: z.string().nullable(),
  mascot_name: z.string().nullable().optional(),
  employee_name: z.string().nullable().optional(),
});

export const eventSchema: z.ZodType<Event> = z.object({
  id: z.string().min(1),
  client_id: z.string().nullable(),
  client_contact_id: z.string().nullable().optional(),
  communication_channel: z
    .enum([
      'whatsapp',
      'olx',
      'facebook',
      'instagram',
      'call',
      'tiktok',
      'email',
    ])
    .nullable()
    .optional(),
  contact_value: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  employee_id: z.string().nullable(),
  employee_ids: z.array(z.string()).optional(),
  mascot_id: z.string().nullable(),
  mascot_ids: z.array(z.string()).optional(),
  date: z.string(),
  event_month: z.string().nullable().optional(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  duration_minutes: z.number().int().nonnegative().optional(),
  price_per_hour: z.number(),
  transport_cost: z.number().optional(),
  employee_hourly_rate: z.number().optional(),
  total_amount: z.number().optional(),
  employee_cost: z.number().optional(),
  profit_amount: z.number().optional(),
  paid_amount: z.number().optional(),
  outgoing_amount: z.number().optional(),
  cash_profit_amount: z.number().optional(),
  balance_due: z.number().optional(),
  payments_count: z.number().int().nonnegative().optional(),
  documents_count: z.number().int().nonnegative().optional(),
  location: z.string().nullable(),
  address: z.string().nullable().optional(),
  map_location: mapLocationSchema.nullable().optional(),
  type: z.string(),
  status: eventStatusSchema.optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  assignments: z.array(eventAssignmentSchema).optional(),
  employees: z.array(employeeSchema).optional(),
  mascot: mascotSchema.nullable().optional(),
  mascots: z.array(mascotSchema).optional(),
  notes: z.string().nullable().optional(),
});

export const eventPaymentSchema: z.ZodType<EventPayment> = z.object({
  id: z.string().min(1),
  event_id: z.string().min(1),
  type: z.enum(['incoming', 'outgoing']),
  category: z.string(),
  amount: z.number(),
  overtime: z
    .object({
      duration_minutes: z
        .number()
        .int()
        .positive()
        .max(MAX_OVERTIME_HOURS * MINUTES_PER_HOUR),
      hourly_rate: z.number().positive(),
      employee_ids: z.array(z.string().min(1)).min(1),
      amount: z.number().nonnegative(),
    })
    .nullable()
    .optional(),
  paid_at: z.string(),
  method: z.string().nullable().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']),
  notes: z.string().nullable().optional(),
});

export const eventReviewSchema: z.ZodType<EventReview> = z.object({
  event_id: z.string().min(1),
  url: z.string().url(),
  share_message: z.string(),
  submitted_at: z.string().nullable(),
  reviewer_name: z.string().nullable(),
  source: z.string().nullable(),
  source_details: z.string().nullable(),
  entertainers_rating: z.number().int().min(1).max(5).nullable(),
  entertainers_comment: z.string().nullable(),
  improvement_suggestion: z.string().nullable(),
  website_consent: z.boolean().nullable(),
});

export const reviewNotificationSchema: z.ZodType<ReviewNotification> = z.object(
  {
    id: z.string().min(1),
    event_id: z.string().min(1),
    reviewer_name: z.string().min(1),
    submitted_at: z.string().min(1),
    delivered_at: z.string().nullable(),
  },
);

export const eventDocumentSchema: z.ZodType<EventDocument> = z.object({
  id: z.string().min(1),
  event_id: z.string().min(1),
  document_type: z.enum(['contract', 'invoice', 'other']),
  title: z.string(),
  original_name: z.string(),
  mime_type: z.string().nullable().optional(),
  size_bytes: z.number().int().nonnegative(),
  document_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const availabilityConflictSchema = z.object({
  event_id: z.string().min(1),
  location: z.string().nullable(),
  start_time: z.string(),
  end_time: z.string(),
});

export const availabilitySummarySchema: z.ZodType<AvailabilitySummary> =
  z.object({
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    events: z.array(
      z.object({
        id: z.string().min(1),
        employee_id: z.string().nullable(),
        employee_ids: z.array(z.string()).optional(),
        employee_name: z.string().nullable().optional(),
        employee_names: z.array(z.string()).optional(),
        mascot_id: z.string().nullable(),
        mascot_ids: z.array(z.string()).optional(),
        mascot_name: z.string().nullable().optional(),
        mascot_names: z.array(z.string()).optional(),
        location: z.string().nullable(),
        status: eventStatusSchema,
        start_time: z.string().nullable(),
        end_time: z.string().nullable(),
      }),
    ),
    employees: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string(),
        gender: z.enum(['male', 'female']).nullable().optional(),
        hourly_rate: z.number().nullable(),
        is_available: z.boolean(),
        availability_status: z.enum(['available', 'busy']).optional(),
        conflict: availabilityConflictSchema.nullable(),
        warnings: z.array(z.string()).optional(),
      }),
    ),
    mascots: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string(),
        price_per_hour: z.number(),
        is_available: z.boolean(),
        conflict: availabilityConflictSchema.nullable(),
      }),
    ),
  });

export const documentDownloadSchema = z.object({
  download_url: z.string().url(),
  expires_in_minutes: z.number().int().positive(),
});
