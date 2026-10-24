import { z } from 'zod';
import {
  hallSchema,
  hallBookingSchema,
} from '@/features/halls/schemas/hallApiSchemas';

export type Hall = z.infer<typeof hallSchema>;
export type HallBooking = z.infer<typeof hallBookingSchema>;
export type HallStatus = 'all' | 'active' | 'inactive';
export type HallFilters = { search: string; status: HallStatus };
export type HallPhotoDraft = {
  key: string;
  imageId?: string;
  uri: string | null;
  file?: { uri: string; name: string; type: string };
};
