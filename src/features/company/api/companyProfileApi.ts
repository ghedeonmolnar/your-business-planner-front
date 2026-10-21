import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import {
  companyProfileSchema,
  fiscalProfileSchema,
} from '@/features/company/schemas/companyProfileSchemas';

export const getCompanyProfileApi = (signal?: AbortSignal) =>
  apiRequest('/company', { signal, schema: companyProfileSchema });

export const lookupFiscalProfileApi = (fiscalCode: string) =>
  apiRequest('/company/fiscal-lookup', {
    method: 'POST',
    body: { fiscal_code: fiscalCode },
    schema: fiscalProfileSchema,
  });

export const saveOwnerProfileApi = (payload: { name: string }) =>
  apiRequest('/profile', {
    method: 'PUT',
    body: payload,
    schema: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  });
