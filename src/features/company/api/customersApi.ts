import { apiPageRequest, apiRequest } from '@/shared/api/client';
import {
  customerListItemSchema,
  customerSchema,
} from '@/features/company/schemas/customerListSchemas';
import {
  CustomerFilters,
  CustomerListItem,
  DirectoryItem,
} from '@/features/company/types';

export const getCustomersApi = (
  filters: CustomerFilters,
  page: number,
  signal?: AbortSignal,
) => {
  const parameters = Object.entries(filters)
    .filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[1] !== '',
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return apiPageRequest<CustomerListItem>(
    `/clients?${parameters}`,
    page,
    undefined,
    { signal, itemSchema: customerListItemSchema },
  );
};

export const getCustomerApi = (id: string, signal?: AbortSignal) =>
  apiRequest<DirectoryItem>(`/clients/${encodeURIComponent(id)}`, {
    signal,
    schema: customerSchema,
  });
