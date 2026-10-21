import {
  ApiError,
  ApiPage,
  apiPageRequest,
  apiPaginatedRequest,
  apiRequest,
} from '@/shared/api/client';
import {
  AvailabilityQuery,
  AvailabilitySummary,
  Event,
  EventDocument,
  EventDocumentMetadataPayload,
  EventListFilters,
  EventPayload,
  EventPayment,
  EventPaymentPayload,
  EventReview,
  ReviewNotification,
} from '@/features/events/types';
import {
  availabilitySummarySchema,
  documentDownloadSchema,
  eventDocumentSchema,
  eventPaymentSchema,
  eventReviewSchema,
  eventSchema,
  reviewNotificationSchema,
} from '@/features/events/schemas/eventApiSchemas';
import { actionResponseSchema } from '@/shared/api/responseSchemas';

const withFilters = (path: string, filters: EventListFilters) => {
  const params = new URLSearchParams();

  if (filters.date_from) {
    params.set('date_from', filters.date_from);
  }

  if (filters.date_to) {
    params.set('date_to', filters.date_to);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.timeframe) {
    params.set('timeframe', filters.timeframe);
  }

  const query = params.toString();

  return query ? `${path}?${query}` : path;
};

export const getEventsPageApi = (
  filters: EventListFilters,
  page: number,
  perPage: number,
): Promise<ApiPage<Event>> =>
  apiPageRequest<Event>(withFilters('/events', filters), page, perPage, {
    itemSchema: eventSchema,
  });

export const getEventsInRangeApi = (filters: EventListFilters) =>
  apiPaginatedRequest<Event>(withFilters('/events', filters), {
    itemSchema: eventSchema,
  });

export const getEventApi = (id: string) =>
  apiRequest<Event>('/events/' + id, { schema: eventSchema });

export const getUpcomingEventsPageApi = (page: number, perPage: number) =>
  apiPageRequest<Event>('/events-upcoming', page, perPage, {
    itemSchema: eventSchema,
  });

export const createEventApi = (payload: EventPayload) =>
  apiRequest<Event>('/events', {
    method: 'POST',
    body: payload,
    schema: eventSchema,
  });

export const updateEventApi = (id: string, payload: EventPayload) =>
  apiRequest<Event>(`/events/${id}`, {
    method: 'PUT',
    body: payload,
    schema: eventSchema,
  });

export const deleteEventApi = (id: string) =>
  apiRequest(`/events/${id}`, {
    method: 'DELETE',
    schema: actionResponseSchema,
  });

export const getAvailabilityApi = (query: AvailabilityQuery) => {
  const params = new URLSearchParams({
    date: query.date,
    start_time: query.start_time,
    end_time: query.end_time,
  });

  if (query.exclude_event_id) {
    params.set('exclude_event_id', query.exclude_event_id);
  }

  return apiRequest<AvailabilitySummary>(`/availability?${params.toString()}`, {
    schema: availabilitySummarySchema,
  });
};

export const getEventPaymentsApi = (eventId: string) =>
  apiPaginatedRequest<EventPayment>(`/events/${eventId}/payments`, {
    itemSchema: eventPaymentSchema,
  });

export const createEventPaymentApi = (
  eventId: string,
  payload: EventPaymentPayload,
) =>
  apiRequest<EventPayment>(`/events/${eventId}/payments`, {
    method: 'POST',
    body: payload,
    schema: eventPaymentSchema,
  });

export const updateEventPaymentApi = (
  id: string,
  payload: Partial<EventPaymentPayload>,
) =>
  apiRequest<EventPayment>(`/event-payments/${id}`, {
    method: 'PUT',
    body: payload,
    schema: eventPaymentSchema,
  });

export const deleteEventPaymentApi = (id: string) =>
  apiRequest(`/event-payments/${id}`, {
    method: 'DELETE',
    schema: actionResponseSchema,
  });

export const getEventReviewApi = async (eventId: string) => {
  try {
    return await apiRequest<EventReview>(`/events/${eventId}/review`, {
      schema: eventReviewSchema,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
};

export const createEventReviewLinkApi = (eventId: string) =>
  apiRequest<EventReview>(`/events/${eventId}/review-link`, {
    method: 'POST',
    schema: eventReviewSchema,
  });

export const getReviewNotificationsPageApi = (
  page: number,
  perPage: number,
) =>
  apiPageRequest<ReviewNotification>('/review-notifications', page, perPage, {
    itemSchema: reviewNotificationSchema,
  });

export const markReviewNotificationDeliveredApi = (id: string) =>
  apiRequest<ReviewNotification>(`/review-notifications/${id}/delivered`, {
    method: 'PUT',
    schema: reviewNotificationSchema,
  });

export const getEventDocumentsApi = (eventId: string) =>
  apiPaginatedRequest<EventDocument>(`/events/${eventId}/documents`, {
    itemSchema: eventDocumentSchema,
  });

export const createEventDocumentApi = (eventId: string, payload: FormData) =>
  apiRequest<EventDocument>(`/events/${eventId}/documents`, {
    method: 'POST',
    body: payload,
    schema: eventDocumentSchema,
  });

export const updateEventDocumentApi = (
  id: string,
  payload: EventDocumentMetadataPayload,
) =>
  apiRequest<EventDocument>(`/event-documents/${id}`, {
    method: 'PUT',
    body: payload,
    schema: eventDocumentSchema,
  });

export const deleteEventDocumentApi = (id: string) =>
  apiRequest(`/event-documents/${id}`, {
    method: 'DELETE',
    schema: actionResponseSchema,
  });

export const getEventDocumentDownloadUrlApi = (id: string) =>
  apiRequest<{ download_url: string; expires_in_minutes: number }>(
    `/event-documents/${id}/download-url`,
    { schema: documentDownloadSchema },
  );
