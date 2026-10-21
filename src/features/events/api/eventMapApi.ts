import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import {
  mapCoordinatesSchema,
  mapLocationSchema,
} from '@/shared/schemas/mapLocationSchema';
import { mapSelectorSchema } from '@/features/events/schemas/eventMapSchemas';
import { MapSelection } from '@/shared/types/mapLocation';

const mapLocationResponseSchema = z.object({
  map_location: mapLocationSchema.nullable(),
});

export const getEventMapSelectorApi = (eventId: string, signal?: AbortSignal) =>
  apiRequest(`/events/${eventId}/map-selector`, {
    method: 'POST',
    signal,
    schema: mapSelectorSchema,
  });

export const resolveEventMapApi = (
  eventId: string,
  selection: MapSelection,
  signal?: AbortSignal,
) =>
  apiRequest(`/events/${eventId}/map-resolve`, {
    method: 'POST',
    body: selection,
    signal,
    schema: mapCoordinatesSchema,
  });

export const saveEventMapApi = (
  eventId: string,
  selection: MapSelection,
  locationRevision: string,
) =>
  apiRequest(`/events/${eventId}/map-location`, {
    method: 'PUT',
    body: { ...selection, location_revision: locationRevision },
    schema: mapLocationResponseSchema,
  });

export const deleteEventMapApi = (eventId: string) =>
  apiRequest(`/events/${eventId}/map-location`, {
    method: 'DELETE',
    schema: mapLocationResponseSchema,
  });
