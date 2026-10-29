import { z } from 'zod';

export const hallBookingSchema = z.object({
  id: z.string(),
  date: z.iso.date(),
  client_name: z.string().nullable(),
  type: z.string(),
  status: z.enum(['confirmed', 'tentative']),
  starts_at: z.iso.datetime({ offset: true }).nullable(),
  ends_at: z.iso.datetime({ offset: true }).nullable(),
});
export const hallImageSchema = z.object({
  id: z.string(),
  url: z.string().url().nullable(),
});
export const hallHoursSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  ends_next_day: z.boolean(),
});
export const hallSchema = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  name: z.string(),
  capacity: z.number().int().positive(),
  address: z.string().nullable(),
  is_active: z.boolean(),
  minimum_guests: z.number().int().positive().nullable(),
  menu_price: z.string().nullable().optional(),
  child_menu_price: z.string().nullable().optional(),
  description: z.string().nullable(),
  area_sqm: z.string().nullable(),
  arrangement: z.string().nullable(),
  amenities: z.array(z.string()),
  business_hours: z.array(hallHoursSchema),
  setup_minutes: z.number().int().nonnegative().nullable(),
  cleanup_minutes: z.number().int().nonnegative().nullable(),
  internal_notes: z.string().nullable(),
  future_bookings_count: z.number().int().nonnegative(),
  tentative_bookings_count: z.number().int().nonnegative(),
  has_history: z.boolean(),
  permissions: z.object({
    can_edit: z.boolean(),
    can_duplicate: z.boolean(),
    can_deactivate: z.boolean(),
    can_delete: z.boolean(),
  }),
  images: z.array(hallImageSchema).max(10),
  next_bookings: z.array(hallBookingSchema).max(3),
});
export const hallPageSchema = z.object({
  data: z.array(hallSchema),
  meta: z.object({
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    status_counts: z.object({
      all: z.number().int().nonnegative(),
      active: z.number().int().nonnegative(),
      inactive: z.number().int().nonnegative(),
    }),
  }),
});
