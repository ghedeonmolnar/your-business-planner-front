import { apiPageRequest, apiRequest } from '@/shared/api/client';
import {
  agendaItemSchema,
  agendaSummarySchema,
  AgendaView,
} from '@/features/company/schemas/agendaSchemas';

export const getAgendaSummaryApi = (signal?: AbortSignal) =>
  apiRequest('/agenda/summary', { signal, schema: agendaSummarySchema });

export const getAgendaItemsApi = (
  view: AgendaView,
  month: string,
  page: number,
  signal?: AbortSignal,
) =>
  apiPageRequest(
    `/agenda/items?view=${encodeURIComponent(view)}&month=${encodeURIComponent(month)}`,
    page,
    undefined,
    { signal, itemSchema: agendaItemSchema },
  );
