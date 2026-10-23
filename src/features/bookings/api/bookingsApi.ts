import { z } from 'zod';
import { apiPageRequest, apiRequest } from '@/shared/api/client';
import {
  Booking,
  BookingFilters,
  BookingPayload,
  CalendarSummary,
} from '@/features/bookings/types';
import {
  bookingSchema,
  bookingResponseSchema,
  calendarSummarySchema,
} from '@/features/bookings/schemas/bookingApiSchemas';

export const bookingQuery = (filters: BookingFilters) =>
  Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => key + '=' + encodeURIComponent(value ?? ''))
    .join('&');
export const getBookingsApi = (
  filters: BookingFilters,
  page: number,
  signal?: AbortSignal,
) =>
  apiPageRequest<Booking>('/events?' + bookingQuery(filters), page, undefined, {
    signal,
    itemSchema: bookingSchema,
  });
export const getBookingApi = (id: string, signal?: AbortSignal) =>
  apiRequest<Booking>('/events/' + id, {
    signal,
    schema: bookingResponseSchema,
  });
export const saveBookingApi = ({
  id,
  payload,
}: {
  id?: string;
  payload: BookingPayload;
}) =>
  apiRequest<Booking>(id ? '/events/' + id : '/events', {
    method: id ? 'PUT' : 'POST',
    body: payload,
    schema: bookingResponseSchema,
  });
export const cancelBookingApi = ({
  id,
  version,
}: {
  id: string;
  version: number;
}) =>
  apiRequest<Booking>('/events/' + id, {
    method: 'DELETE',
    body: { version },
    schema: bookingResponseSchema,
  });
export const getCalendarApi = (filters: BookingFilters, signal?: AbortSignal) =>
  apiRequest<CalendarSummary>('/calendar?' + bookingQuery(filters), {
    signal,
    schema: calendarSummarySchema,
  });

export const hallDaySchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  booking_id: z.string().nullable(),
  status: z.enum(['free', 'tentative', 'confirmed', 'completed']),
  type: z.string().nullable().optional(),
  starts_at: z.iso.datetime({ offset: true }).nullable().optional(),
  ends_at: z.iso.datetime({ offset: true }).nullable().optional(),
});
export type HallDay = z.infer<typeof hallDaySchema>;
export const getHallDayApi = (
  date: string,
  page: number,
  signal?: AbortSignal,
  hallId?: string,
) =>
  apiPageRequest(
    '/calendar/day?' + bookingQuery({ date, hall_id: hallId }),
    page,
    undefined,
    { signal, itemSchema: hallDaySchema },
  );
