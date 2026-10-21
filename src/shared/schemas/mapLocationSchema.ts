import { z } from 'zod';
import { MapLocation } from '@/shared/types/mapLocation';

export const mapCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const confirmation = {
  confirmed: z.boolean(),
  confirmed_at: z.string().min(1).nullable(),
};

export const mapLocationSchema: z.ZodType<MapLocation> = z
  .discriminatedUnion('kind', [
    z.object({
      ...confirmation,
      kind: z.literal('google_place'),
      place_id: z.string().min(1).max(255),
      latitude: z.null(),
      longitude: z.null(),
    }),
    z.object({
      ...confirmation,
      ...mapCoordinatesSchema.shape,
      kind: z.literal('manual_pin'),
      place_id: z.null(),
    }),
  ])
  .refine(point => point.confirmed === (point.confirmed_at !== null));
