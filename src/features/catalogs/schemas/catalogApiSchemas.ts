import { z } from 'zod';
import { Catalogs } from '@/features/catalogs/types';

const catalogOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const catalogsSchema: z.ZodType<Catalogs> = z.object({
  event_types: z.array(catalogOptionSchema),
  client_sources: z.array(catalogOptionSchema),
  event_statuses: z.array(catalogOptionSchema),
  communication_channels: z.array(catalogOptionSchema),
  event_hour_times: z.array(catalogOptionSchema),
  bihor_localities: z.array(catalogOptionSchema),
});
