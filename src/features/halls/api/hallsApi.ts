import { z } from 'zod';
import { apiRequest, DEFAULT_PAGE_SIZE } from '@/shared/api/client';
import {
  hallSchema,
  hallPageSchema,
} from '@/features/halls/schemas/hallApiSchemas';
import { HallFilters } from '@/features/halls/types';

const HALL_UPLOAD_TIMEOUT_MS = 60_000;

export const getHallsApi = (
  filters: HallFilters,
  page: number,
  signal?: AbortSignal,
) =>
  apiRequest(
    `/halls?search=${encodeURIComponent(filters.search)}&status=${filters.status}&page=${page}&per_page=${DEFAULT_PAGE_SIZE}`,
    { signal, schema: hallPageSchema },
  );
export const getHallApi = (id: string, signal?: AbortSignal) =>
  apiRequest(`/halls/${id}`, { signal, schema: hallSchema });
export const saveHallApi = ({ id, body }: { id?: string; body: FormData }) =>
  apiRequest(id ? `/halls/${id}` : '/halls', {
    method: 'POST',
    timeoutMs: HALL_UPLOAD_TIMEOUT_MS,
    body,
    schema: hallSchema,
  });
export const setHallStatusApi = ({
  id,
  version,
  active,
}: {
  id: string;
  version: number;
  active: boolean;
}) =>
  apiRequest(`/halls/${id}/status`, {
    method: 'POST',
    body: { version, is_active: active },
    schema: hallSchema,
  });
export const deleteHallApi = ({
  id,
  version,
}: {
  id: string;
  version: number;
}) =>
  apiRequest(`/halls/${id}`, {
    method: 'DELETE',
    body: { version },
    schema: z.object({ status: z.literal('deleted') }),
  });
