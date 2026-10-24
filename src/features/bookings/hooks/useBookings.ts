import { useEffect } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getHallDayApi,
  cancelBookingApi,
  getBookingApi,
  getBookingsApi,
  getCalendarApi,
  saveBookingApi,
} from '@/features/bookings/api/bookingsApi';
import { BookingFilters } from '@/features/bookings/types';
import { queryKeys } from '@/shared/api/queryKeys';
import { invalidatePlannerBooking } from '@/shared/api/queryInvalidation';
import { apiErrorCode } from '@/shared/api/apiError';

const AGENDA_REFRESH_INTERVAL_MS = 30_000;

export const useBookings = (filters: BookingFilters = {}, enabled = true) => {
  const { user } = useAuth();
  const client = useQueryClient();
  const queryKey = queryKeys.planner.bookings(user?.company?.id ?? '', filters);
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      getBookingsApi(filters, pageParam.page, signal, pageParam.snapshot),
    initialPageParam: { page: 1, snapshot: undefined as string | undefined },
    getNextPageParam: page =>
      page.page < page.lastPage
        ? { page: page.page + 1, snapshot: page.snapshot }
        : undefined,
    enabled: enabled && Boolean(user?.subscription?.active),
    refetchInterval:
      filters.agenda === 'upcoming' ? AGENDA_REFRESH_INTERVAL_MS : false,
  });
  const changed = apiErrorCode(query.error) === 'BOOKING_LIST_CHANGED';
  useEffect(() => {
    if (changed) void client.resetQueries({ queryKey, exact: true });
  }, [changed, client, queryKey]);
  return query;
};
export const useBooking = (id: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planner.booking(user?.company?.id ?? '', id),
    queryFn: ({ signal }) => getBookingApi(id, signal),
    enabled: Boolean(id && user?.subscription?.active),
  });
};
export const useCalendar = (filters: BookingFilters, enabled = true) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planner.calendar(user?.company?.id ?? '', filters),
    queryFn: ({ signal }) => getCalendarApi(filters, signal),
    enabled:
      enabled &&
      Boolean(user?.subscription?.active && user.role !== 'employee'),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
};
export const useSaveBooking = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: saveBookingApi,
    onSuccess: booking =>
      invalidatePlannerBooking(client, user?.company?.id ?? '', booking.id),
  });
};
export const useCancelBooking = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: cancelBookingApi,
    onSuccess: (_result, variables) =>
      invalidatePlannerBooking(client, user?.company?.id ?? '', variables.id),
  });
};

export const useHallDay = (date: string, hallId?: string) => {
  const { user } = useAuth();
  const client = useQueryClient();
  const queryKey = queryKeys.planner.directory(
    user?.company?.id ?? '',
    'hall-day',
    {
      date,
      hall_id: hallId,
    },
  );
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      getHallDayApi(date, pageParam.page, signal, hallId, pageParam.snapshot),
    initialPageParam: { page: 1, snapshot: undefined as string | undefined },
    getNextPageParam: page =>
      page.page < page.lastPage
        ? { page: page.page + 1, snapshot: page.snapshot }
        : undefined,
    enabled: Boolean(user?.subscription?.active && user.role !== 'employee'),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
  const changed = apiErrorCode(query.error) === 'CALENDAR_DAY_LIST_CHANGED';
  useEffect(() => {
    if (changed) void client.resetQueries({ queryKey, exact: true });
  }, [changed, client, queryKey]);
  return query;
};
