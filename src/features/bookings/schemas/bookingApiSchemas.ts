import { z } from 'zod';

export const staffAssignmentSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string(),
  employee_name: z.string().nullable().optional(),
  job_role: z.string(),
  pay_type: z.enum(['fixed', 'hourly']),
  rate: z.string(),
  starts_at: z.iso.datetime({ offset: true }),
  ends_at: z.iso.datetime({ offset: true }),
  estimated_cost: z.string().optional(),
});
export const bookingSchema = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  hall_id: z.string(),
  hall_name: z.string().nullable(),
  client_id: z.string(),
  client_name: z.string().nullable(),
  client_phone: z.string().nullable(),
  client_version: z.number().int().positive().nullable().optional(),
  date: z.iso.date(),
  type: z.string(),
  status: z.enum([
    'tentative',
    'confirmed',
    'completed',
    'cancelled',
    'expired',
  ]),
  starts_at: z.iso.datetime({ offset: true }).nullable(),
  ends_at: z.iso.datetime({ offset: true }).nullable(),
  expires_at: z.iso.datetime({ offset: true }).nullable(),
  notes: z.string().nullable(),
  staff: z.array(staffAssignmentSchema),
  minimum_guests: z.number().optional(),
  estimated_guests: z.number().int().nonnegative().nullable().optional(),
  child_guests: z.number().int().nonnegative().nullable().optional(),
  child_menu_price: z.string().optional(),
  final_guests: z.number().nullable().optional(),
  menu_price: z.string().optional(),
  menu_name: z.string().nullable().optional(),
  minimum_amount: z.string().optional(),
  total_amount: z.string().optional(),
  agreed_advance: z.string().optional(),
  advance_due_at: z.string().nullable().optional(),
  extra_services: z
    .array(z.object({ name: z.string(), amount: z.string() }))
    .optional(),
  paid_amount: z.string().optional(),
  outgoing_amount: z.string().optional(),
  cash_profit_amount: z.string().optional(),
  employee_cost: z.string().optional(),
  balance_due: z.string().optional(),
  documents_count: z.number().optional(),
  incoming_payments_count: z.number().int().nonnegative().optional(),
  outgoing_payments_count: z.number().int().nonnegative().optional(),
});
export const calendarSummarySchema = z.object({
  availability_revision: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  revision: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  halls: z.array(
    z.object({ id: z.string(), name: z.string(), is_active: z.boolean() }),
  ),
  days: z.array(
    z.object({
      date: z.iso.date(),
      confirmed: z.number().int().nonnegative(),
      tentative: z.number().int().nonnegative(),
      free: z.number().int().nonnegative(),
      occupied_halls: z.number().int().nonnegative().optional(),
      active_capacity: z.number().int().nonnegative().optional(),
      active_occupied_halls: z.number().int().nonnegative().optional(),
      historical_occupied_halls: z.number().int().nonnegative().optional(),
    }),
  ),
});
export const bookingResponseSchema = bookingSchema;
export const bookingPageSchema = z.object({
  data: z.array(bookingSchema),
  meta: z.object({
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    snapshot: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    months: z
      .array(
        z.object({
          month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
          total: z.number().int().nonnegative(),
        }),
      )
      .optional(),
  }),
});
