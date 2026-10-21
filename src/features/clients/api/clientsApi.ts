import { ApiPage, apiPageRequest, apiRequest } from '@/shared/api/client';
import { Client, ClientLookup, ClientPayload } from '@/features/clients/types';
import { Event, EventTimeframe } from '@/features/events/types';
import { eventSchema } from '@/features/events/schemas/eventApiSchemas';
import {
  clientLookupSchema,
  clientSchema,
} from '@/features/clients/schemas/clientApiSchemas';
import { actionResponseSchema } from '@/shared/api/responseSchemas';

export const getClientsPageApi = (
  page: number,
  perPage: number,
): Promise<ApiPage<Client>> =>
  apiPageRequest<Client>('/clients', page, perPage, {
    itemSchema: clientSchema,
  });

export const getClientApi = (id: string) =>
  apiRequest<Client>(`/clients/${id}`, { schema: clientSchema });

export const getClientEventsPageApi = (
  id: string,
  timeframe: EventTimeframe,
  page: number,
  perPage: number,
): Promise<ApiPage<Event>> =>
  apiPageRequest<Event>(
    `/clients/${id}/events?timeframe=${timeframe}`,
    page,
    perPage,
    { itemSchema: eventSchema },
  );

export const lookupClientApi = (channel: string, value: string) => {
  const params = new URLSearchParams({
    communication_channel: channel,
    contact_value: value,
  });

  return apiRequest<ClientLookup>(`/clients-lookup?${params.toString()}`, {
    schema: clientLookupSchema,
  });
};

export const createClientApi = (payload: ClientPayload) =>
  apiRequest<Client>('/clients', {
    method: 'POST',
    body: payload,
    schema: clientSchema,
  });

export const updateClientApi = (id: string, payload: ClientPayload) =>
  apiRequest<Client>(`/clients/${id}`, {
    method: 'PUT',
    body: payload,
    schema: clientSchema,
  });

export const deleteClientApi = (id: string) =>
  apiRequest(`/clients/${id}`, {
    method: 'DELETE',
    schema: actionResponseSchema,
  });
