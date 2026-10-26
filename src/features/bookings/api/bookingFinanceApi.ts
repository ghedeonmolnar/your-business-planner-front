import { z } from 'zod';
import { apiPageRequest, apiRequest } from '@/shared/api/client';
import {
  bookingDocumentApiSchema,
  bookingPaymentApiSchema,
  bookingDownloadSchema,
} from '@/features/bookings/schemas/bookingFinanceSchemas';
import { EventDocumentMetadataPayload } from '@/features/events/types';
import { BookingPaymentPayload } from '@/features/bookings/types';

export const getBookingPaymentApi = (id: string) =>
  apiRequest('/event-payments/' + id, { schema: bookingPaymentApiSchema });

export const getBookingPaymentsApi = (
  id: string,
  page: number,
  signal?: AbortSignal,
) =>
  apiPageRequest('/events/' + id + '/payments', page, undefined, {
    signal,
    itemSchema: bookingPaymentApiSchema,
  });
export const saveBookingPaymentApi = ({
  eventId,
  id,
  payload,
}: {
  eventId: string;
  id?: string;
  payload: BookingPaymentPayload;
}) =>
  apiRequest(
    id ? '/event-payments/' + id : '/events/' + eventId + '/payments',
    {
      method: id ? 'PUT' : 'POST',
      body: payload,
      schema: bookingPaymentApiSchema,
    },
  );
export const cancelBookingPaymentApi = ({
  id,
  version,
}: {
  id: string;
  version: number;
}) =>
  apiRequest('/event-payments/' + id, {
    method: 'DELETE',
    body: { version },
    schema: z.object({ status: z.literal('cancelled') }),
  });
export const getBookingDocumentsApi = (
  id: string,
  page: number,
  signal?: AbortSignal,
) =>
  apiPageRequest('/events/' + id + '/documents', page, undefined, {
    signal,
    itemSchema: bookingDocumentApiSchema,
  });
export const uploadBookingDocumentApi = ({
  eventId,
  payload,
}: {
  eventId: string;
  payload: FormData;
}) =>
  apiRequest('/events/' + eventId + '/documents', {
    method: 'POST',
    body: payload,
    schema: bookingDocumentApiSchema,
  });
export const updateBookingDocumentApi = ({
  id,
  payload,
}: {
  id: string;
  payload: EventDocumentMetadataPayload;
}) =>
  apiRequest('/event-documents/' + id, {
    method: 'PUT',
    body: payload,
    schema: bookingDocumentApiSchema,
  });
export const deleteBookingDocumentApi = (id: string) =>
  apiRequest('/event-documents/' + id, { method: 'DELETE' });
export const getBookingDownloadApi = (id: string) =>
  apiRequest('/event-documents/' + id + '/download-url', {
    schema: bookingDownloadSchema,
  });
