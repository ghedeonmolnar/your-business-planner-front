import { z } from 'zod';
import { apiRequest, ApiError } from '@/shared/api/client';

const policySchema = z.object({
  mode: z.enum(['observe', 'recommend', 'enforce']),
  min_build: z.number().int().nonnegative(),
  recommended_build: z.number().int().nonnegative(),
  contract_version: z.string().regex(/^[a-zA-Z0-9._-]{1,40}$/),
  store_url: z
    .url()
    .refine(value => {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password;
    })
    .nullable(),
});
export const getMobilePolicyApi = async (signal?: AbortSignal) => {
  try {
    return await apiRequest('/mobile-policy', {
      auth: false,
      signal,
      schema: policySchema,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
};
