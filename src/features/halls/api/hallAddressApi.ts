import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';

const suggestionsSchema = z.object({
  suggestions: z.array(z.object({ id: z.string(), label: z.string() })).max(5),
});

export const getHallAddressSuggestionsApi = (
  query: string,
  signal: AbortSignal,
) =>
  apiRequest('/halls/address-suggestions', {
    method: 'POST',
    body: { query },
    signal,
    schema: suggestionsSchema,
  });
