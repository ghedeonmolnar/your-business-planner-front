import { apiPaginatedRequest, apiRequest } from '@/shared/api/client';
import { Mascot, MascotPayload, MascotProfile } from '@/features/mascots/types';
import {
  mascotProfileSchema,
  mascotSchema,
} from '@/features/mascots/schemas/mascotApiSchemas';
import { actionResponseSchema } from '@/shared/api/responseSchemas';

export const getMascotsApi = () =>
  apiPaginatedRequest<Mascot>('/mascots', { itemSchema: mascotSchema });

export const getMascotProfileApi = (id: string) =>
  apiRequest<MascotProfile>(`/mascots/${id}`, { schema: mascotProfileSchema });

export const createMascotApi = (payload: MascotPayload) =>
  apiRequest<Mascot>('/mascots', {
    method: 'POST',
    body: payload,
    schema: mascotSchema,
  });

export const updateMascotApi = (id: string, payload: MascotPayload) =>
  apiRequest<Mascot>(`/mascots/${id}`, {
    method: 'POST',
    body: payload,
    schema: mascotSchema,
  });

export const deleteMascotApi = (id: string) =>
  apiRequest(`/mascots/${id}`, {
    method: 'DELETE',
    schema: actionResponseSchema,
  });

export const forceDeleteMascotApi = (id: string) =>
  apiRequest(`/mascots/${id}/permanent`, {
    method: 'DELETE',
    schema: actionResponseSchema,
  });
