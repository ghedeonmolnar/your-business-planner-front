import { z } from 'zod';
import { mapLocationSchema } from '@/shared/schemas/mapLocationSchema';
import {
  EmployeeAgendaSummary,
  EmployeeEvent,
  EmployeeStatistics,
} from '@/features/employeeWorkspace/types';

const rankedItemSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  events_count: z.number().int().nonnegative(),
});

export const employeeEventSchema: z.ZodType<EmployeeEvent> = z.object({
  id: z.string().min(1),
  date: z.string(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  duration_minutes: z.number().int().nonnegative(),
  location: z.string().nullable(),
  address: z.string().nullable(),
  map_location: mapLocationSchema.nullable().optional(),
  type: z.string().nullable(),
  type_label: z.string().nullable(),
  status: z.enum(['partial_details', 'confirmed', 'completed', 'cancelled']),
  status_label: z.string(),
  client_name: z.string().nullable(),
  contact_phone: z.string().nullable(),
  mascot: z
    .object({ id: z.string().min(1), name: z.string() })
    .nullable(),
  coworkers: z.array(z.object({ id: z.string().min(1), name: z.string() })),
  earnings: z.number().nullable(),
  projected_earnings: z.number().nullable(),
  amount_to_collect: z.number().nonnegative().nullable().default(null),
});

export const employeeAgendaSummarySchema: z.ZodType<EmployeeAgendaSummary> =
  z.object({
    upcoming_events_count: z.number().int().nonnegative(),
    projected_earnings: z.number(),
  });

export const employeeStatisticsSchema: z.ZodType<EmployeeStatistics> = z.object({
  period: z.enum(['month', 'all']),
  month: z.string().nullable(),
  earnings: z.number(),
  events_count: z.number().int().nonnegative(),
  worked_minutes: z.number().int().nonnegative(),
  top_coworker: rankedItemSchema.nullable(),
  top_mascot: rankedItemSchema.nullable(),
});
