import { z } from 'zod';
import {
  Mascot,
  MascotProfile,
  MascotProfileEvent,
} from '@/features/mascots/types';

export const mascotSchema: z.ZodType<Mascot> = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  image_path: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  price_per_hour: z.number(),
  is_active: z.boolean(),
});

const mascotProfileEventSchema: z.ZodType<MascotProfileEvent> = z.object({
  id: z.string().min(1),
  date: z.string(),
  location: z.string().nullable(),
  address: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  duration_minutes: z.number().int().nonnegative(),
  earnings: z.number(),
  employee_names: z.array(z.string()),
});

export const mascotProfileSchema: z.ZodType<MascotProfile> = mascotSchema.and(
  z.object({
    created_at: z.string(),
    total_earnings: z.number(),
    events: z.array(mascotProfileEventSchema),
  }),
);
