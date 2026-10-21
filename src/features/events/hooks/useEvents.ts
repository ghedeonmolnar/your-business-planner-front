import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createEventApi,
  createEventReviewLinkApi,
  deleteEventApi,
  getAvailabilityApi,
  getEventReviewApi,
  getEventApi,
  getEventsInRangeApi,
  getEventsPageApi,
  getReviewNotificationsPageApi,
  getUpcomingEventsPageApi,
  markReviewNotificationDeliveredApi,
  updateEventApi,
} from '@/features/events/api/eventsApi';
import { reminderWindowRange } from '@/shared/utils/reminderWindow';
import {
  AvailabilityQuery,
  EventListFilters,
  EventPayload,
} from '@/features/events/types';
import {
  invalidateEventDetails,
  invalidateSchedulingData,
} from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';
import { TIME_SENSITIVE_REFRESH_INTERVAL_MS } from '@/shared/api/queryRefresh';

const EVENTS_PAGE_SIZE = 20;
const REVIEW_NOTIFICATIONS_PAGE_SIZE = 20;
const REVIEW_NOTIFICATIONS_REFRESH_INTERVAL_MS = 60_000;

export const useEventsList = (filters: EventListFilters = {}) =>
  useInfiniteQuery({
    queryKey: queryKeys.events.list(filters),
    queryFn: ({ pageParam }) =>
      getEventsPageApi(filters, pageParam, EVENTS_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.lastPage ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });

export const useEventsInRange = (
  dateFrom: string,
  dateTo: string,
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.events.list({ date_from: dateFrom, date_to: dateTo }),
    queryFn: () =>
      getEventsInRangeApi({ date_from: dateFrom, date_to: dateTo }),
    enabled,
  });

export const useReminderWindowEvents = (enabled: boolean) => {
  const { dateFrom, dateTo } = reminderWindowRange();

  return useQuery({
    queryKey: queryKeys.events.reminderWindow(dateFrom, dateTo),
    queryFn: () =>
      getEventsInRangeApi({ date_from: dateFrom, date_to: dateTo }),
    enabled,
  });
};

export const useEvent = (id: string) =>
  useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => getEventApi(id),
  });

export const useUpcomingEvents = () =>
  useInfiniteQuery({
    queryKey: queryKeys.events.upcoming,
    refetchInterval: TIME_SENSITIVE_REFRESH_INTERVAL_MS,
    queryFn: ({ pageParam }) =>
      getUpcomingEventsPageApi(pageParam, EVENTS_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.lastPage ? lastPage.page + 1 : undefined,
  });

export const useAvailability = (query: AvailabilityQuery, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.events.availability(query),
    queryFn: () => getAvailabilityApi(query),
    enabled,
  });

export const useEventReview = (eventId: string | null, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.events.review(eventId ?? ''),
    queryFn: () => getEventReviewApi(eventId ?? ''),
    enabled: enabled && Boolean(eventId),
  });

export const useCreateEventReviewLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventReviewLinkApi,
    onSuccess: (review, eventId) => {
      queryClient.setQueryData(queryKeys.events.review(eventId), review);
    },
  });
};

export const useReviewNotifications = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.events.reviewNotifications,
    queryFn: () =>
      getReviewNotificationsPageApi(1, REVIEW_NOTIFICATIONS_PAGE_SIZE),
    enabled,
    refetchInterval: REVIEW_NOTIFICATIONS_REFRESH_INTERVAL_MS,
  });

export const useMarkReviewNotificationDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markReviewNotificationDeliveredApi,
    onSuccess: notification =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.events.reviewNotifications,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.events.review(notification.event_id),
        }),
      ]),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventApi,
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EventPayload }) =>
      updateEventApi(id, payload),
    onSuccess: (_data, variables) =>
      invalidateEventDetails(queryClient, variables.id),
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventApi,
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};

export {
  useEventDocuments,
  useCreateEventDocument,
  useUpdateEventDocument,
  useDeleteEventDocument,
  useEventDocumentDownloadUrl,
} from '@/features/events/hooks/useEventDocuments';
export {
  useEventPayments,
  useCreateEventPayment,
  useUpdateEventPayment,
  useDeleteEventPayment,
} from '@/features/events/hooks/useEventPayments';
