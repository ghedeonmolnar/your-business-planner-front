import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEventPaymentsApi,
  createEventPaymentApi,
  updateEventPaymentApi,
  deleteEventPaymentApi,
} from '@/features/events/api/eventsApi';
import { EventPaymentPayload } from '@/features/events/types';
import { invalidateEventFinancials } from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';

export const useEventPayments = (eventId: string | null, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.events.payments(eventId ?? ''),
    queryFn: () => getEventPaymentsApi(eventId ?? ''),
    enabled: enabled && Boolean(eventId),
  });

export const useCreateEventPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload: EventPaymentPayload;
    }) => createEventPaymentApi(eventId, payload),
    onSuccess: (_data, variables) =>
      invalidateEventFinancials(queryClient, variables.eventId),
  });
};

export const useUpdateEventPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      eventId: string;
      payload: Partial<EventPaymentPayload>;
    }) => updateEventPaymentApi(id, payload),
    onSuccess: (_data, variables) =>
      invalidateEventFinancials(queryClient, variables.eventId),
  });
};

export const useDeleteEventPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; eventId: string }) =>
      deleteEventPaymentApi(id),
    onSuccess: (_data, variables) =>
      invalidateEventFinancials(queryClient, variables.eventId),
  });
};
