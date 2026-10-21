import { z } from 'zod';

export const staffAssignmentSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string(),
  employee_name: z.string().nullable().optional(),
  job_role: z.string(),
  pay_type: z.enum(['fixed', 'hourly']),
  rate: z.string(),
  starts_at: z.string(),
  ends_at: z.string(),
  estimated_cost: z.string().optional(),
});
export const bookingSchema = z.object({
  id: z.string(),
  hall_id: z.string(),
  hall_name: z.string().nullable(),
  client_id: z.string(),
  client_name: z.string().nullable(),
  client_phone: z.string().nullable(),
  date: z.string(),
  type: z.string(),
  status: z.enum([
    'tentative',
    'confirmed',
    'completed',
    'cancelled',
    'expired',
  ]),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  expires_at: z.string().nullable(),
  notes: z.string().nullable(),
  staff: z.array(staffAssignmentSchema),
  minimum_guests: z.number().optional(),
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
});
export const calendarSummarySchema = z.object({
  halls: z.array(
    z.object({ id: z.string(), name: z.string(), is_active: z.boolean() }),
  ),
  days: z.array(
    z.object({
      date: z.string(),
      confirmed: z.number(),
      tentative: z.number(),
      free: z.number(),
    }),
  ),
});
export const bookingResponseSchema = bookingSchema;
