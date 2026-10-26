import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEventDocumentsApi,
  getEventDocumentApi,
  createEventDocumentApi,
  updateEventDocumentApi,
  deleteEventDocumentApi,
  getEventDocumentDownloadUrlApi,
} from '@/features/events/api/eventsApi';
import { EventDocumentMetadataPayload } from '@/features/events/types';
import { invalidateEventDocuments } from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';
import { apiErrorCode } from '@/shared/api/apiError';

export const useReloadEventDocument = () =>
  useMutation({ mutationFn: getEventDocumentApi });

export const useEventDocuments = (eventId: string | null, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.events.documents(eventId ?? ''),
    queryFn: () => getEventDocumentsApi(eventId ?? ''),
    enabled: enabled && Boolean(eventId),
  });

export const useCreateEventDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload: FormData;
    }) => createEventDocumentApi(eventId, payload),
    onSuccess: (_data, variables) =>
      invalidateEventDocuments(queryClient, variables.eventId),
  });
};

export const useUpdateEventDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      eventId: string;
      payload: EventDocumentMetadataPayload;
    }) => updateEventDocumentApi(id, payload),
    onError: (error, variables) => {
      if (apiErrorCode(error) === 'RESOURCE_VERSION_CONFLICT')
        return invalidateEventDocuments(queryClient, variables.eventId);
    },
    onSuccess: (_data, variables) =>
      invalidateEventDocuments(queryClient, variables.eventId),
  });
};

export const useDeleteEventDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; eventId: string }) =>
      deleteEventDocumentApi(id),
    onSuccess: (_data, variables) =>
      invalidateEventDocuments(queryClient, variables.eventId),
  });
};

export const useEventDocumentDownloadUrl = () =>
  useMutation({
    mutationFn: getEventDocumentDownloadUrlApi,
  });
