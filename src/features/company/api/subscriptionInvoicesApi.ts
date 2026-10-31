import { z } from 'zod';
import { apiPageRequest, apiRequest } from '@/shared/api/client';
import { subscriptionInvoiceSchema } from '@/features/company/schemas/subscriptionInvoiceSchema';

export const getSubscriptionInvoicesApi = (
  page: number,
  signal?: AbortSignal,
) =>
  apiPageRequest('/subscription-invoices', page, undefined, {
    signal,
    itemSchema: subscriptionInvoiceSchema,
  });

export const getSubscriptionInvoiceDownloadApi = (id: string) =>
  apiRequest('/subscription-invoices/' + id + '/download-url', {
    schema: z.object({
      download_url: z.string().url(),
      expires_in_minutes: z.number().int().positive(),
    }),
  });
