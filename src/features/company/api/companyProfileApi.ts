import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import { normalizeFiscalCode } from '@/features/company/utils/fiscalProfileValues';
import {
  companyProfileSchema,
  fiscalProfileSchema,
} from '@/features/company/schemas/companyProfileSchemas';

export const getCompanyProfileApi = (signal?: AbortSignal) =>
  apiRequest('/company', { signal, schema: companyProfileSchema });

export const lookupFiscalProfileApi = (fiscalCode: string) => {
  const code = normalizeFiscalCode(fiscalCode);
  return apiRequest('/company/fiscal-lookup', {
    method: 'POST',
    body: { fiscal_code: code },
    schema: fiscalProfileSchema.refine(profile => profile.fiscal_code === code),
  });
};

export const saveOwnerProfileApi = (payload: { name: string }) =>
  apiRequest('/profile', {
    method: 'PUT',
    body: payload,
    schema: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  });
