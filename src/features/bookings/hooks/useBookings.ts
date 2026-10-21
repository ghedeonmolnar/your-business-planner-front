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

export const useBookings = (filters: BookingFilters = {}, enabled = true) => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.bookings(user?.company?.id ?? '', filters),
    queryFn: ({ pageParam, signal }) =>
      getBookingsApi(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: enabled && Boolean(user?.subscription?.active),
  });
};
export const useBooking = (id: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planner.booking(user?.company?.id ?? '', id),
    queryFn: ({ signal }) => getBookingApi(id, signal),
    enabled: Boolean(id && user?.subscription?.active),
  });
};
export const useCalendar = (filters: BookingFilters) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planner.calendar(user?.company?.id ?? '', filters),
    queryFn: ({ signal }) => getCalendarApi(filters, signal),
    enabled: Boolean(user?.subscription?.active && user.role !== 'employee'),
    staleTime: 30_000,
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
    onSuccess: (_result, id) =>
      invalidatePlannerBooking(client, user?.company?.id ?? '', id),
  });
};

export const useHallDay = (date: string) => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.directory(user?.company?.id ?? '', 'hall-day', {
      date,
    }),
    queryFn: ({ pageParam, signal }) => getHallDayApi(date, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: Boolean(user?.subscription?.active && user.role !== 'employee'),
  });
};
