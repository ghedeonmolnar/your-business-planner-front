import { z } from 'zod';
import { apiRequest, DEFAULT_PAGE_SIZE } from '@/shared/api/client';
import {
  Booking,
  BookingFilters,
  BookingPayload,
  CalendarSummary,
} from '@/features/bookings/types';
import {
  bookingPageSchema,
  bookingResponseSchema,
  calendarSummarySchema,
} from '@/features/bookings/schemas/bookingApiSchemas';

export const bookingQuery = (filters: BookingFilters) =>
  Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => key + '=' + encodeURIComponent(value ?? ''))
    .join('&');
export const getBookingsApi = async (
  filters: BookingFilters,
  page: number,
  signal?: AbortSignal,
  snapshot?: string,
) => {
  const result = await apiRequest(
    `/events?${bookingQuery(filters)}&page=${page}&per_page=${DEFAULT_PAGE_SIZE}${snapshot ? `&snapshot=${encodeURIComponent(snapshot)}` : ''}`,
    {
      signal,
      schema: bookingPageSchema,
    },
  );
  return {
    items: result.data,
    page: result.meta.current_page,
    lastPage: result.meta.last_page,
    total: result.meta.total,
    months: result.meta.months ?? [],
    snapshot: result.meta.snapshot,
  };
};
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

export const getCalendarRevisionApi = (signal?: AbortSignal) =>
  apiRequest('/calendar/revision', {
    signal,
    schema: z.object({ revision: z.string().regex(/^[a-f0-9]{64}$/) }),
  });

export const hallDaySchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  minimum_guests: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().optional(),
  booking_id: z.string().nullable(),
  status: z.enum(['free', 'inactive', 'tentative', 'confirmed', 'completed']),
  type: z.string().nullable().optional(),
  starts_at: z.iso.datetime({ offset: true }).nullable().optional(),
  ends_at: z.iso.datetime({ offset: true }).nullable().optional(),
  bookings: z
    .array(
      z.object({
        id: z.string(),
        status: z.enum(['tentative', 'confirmed', 'completed']),
        type: z.string(),
        starts_at: z.iso.datetime({ offset: true }).nullable(),
        ends_at: z.iso.datetime({ offset: true }).nullable(),
      }),
    )
    .optional(),
});
export type HallDay = z.infer<typeof hallDaySchema>;
export const getHallDayApi = (
  date: string,
  page: number,
  signal?: AbortSignal,
  hallId?: string,
  snapshot?: string,
) =>
  apiRequest(
    `/calendar/day?${bookingQuery({ date, hall_id: hallId })}${hallId ? '&include_inactive=1' : ''}&page=${page}&per_page=${DEFAULT_PAGE_SIZE}${snapshot ? `&snapshot=${encodeURIComponent(snapshot)}` : ''}`,
    {
      signal,
      schema: z.object({
        data: z.array(hallDaySchema),
        meta: z.object({
          current_page: z.number().int().positive(),
          last_page: z.number().int().positive(),
          total: z.number().int().nonnegative(),
          snapshot: z.string().regex(/^[a-f0-9]{64}$/),
          revision: z
            .string()
            .regex(/^[a-f0-9]{64}$/)
            .optional(),
        }),
      }),
    },
  ).then(result => ({
    items: result.data,
    page: result.meta.current_page,
    lastPage: result.meta.last_page,
    total: result.meta.total,
    snapshot: result.meta.snapshot,
    revision: result.meta.revision,
  }));
