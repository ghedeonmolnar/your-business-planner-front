import { z } from 'zod';
import dayjs from 'dayjs';

export const calendarRevisionSchema = z.string().regex(/^[a-f0-9]{64}$/);

export const calendarAvailabilityWindowSchema = z
  .object({
    owner: z.string().min(1).max(2048),
    hallId: z.string().min(1).max(128),
    excludedEventId: z.string().max(128).optional(),
    from: z.iso.date(),
    to: z.iso.date(),
    occupiedDates: z.array(z.iso.date()).max(366),
    revision: calendarRevisionSchema,
    invalidated: z.boolean(),
    lastUsedAt: z.number().finite().nonnegative(),
  })
  .refine(window => window.from <= window.to)
  .refine(
    window =>
      window.from.endsWith('-01') &&
      dayjs(window.from).add(5, 'month').endOf('month').format('YYYY-MM-DD') ===
        window.to,
  )
  .refine(window =>
    window.occupiedDates.every(
      date => date >= window.from && date <= window.to,
    ),
  );

export type CalendarAvailabilityWindow = z.infer<
  typeof calendarAvailabilityWindowSchema
>;

export const calendarAvailabilityStorageSchema = z.object({
  version: z.literal(1),
  windows: z.array(calendarAvailabilityWindowSchema),
});
