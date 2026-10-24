import { useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getHallApi,
  getHallsApi,
  saveHallApi,
  setHallStatusApi,
  deleteHallApi,
} from '@/features/halls/api/hallsApi';
import { HallFilters } from '@/features/halls/types';
import { queryKeys } from '@/shared/api/queryKeys';
import { invalidatePlannerHall } from '@/shared/api/queryInvalidation';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

const HALL_STALE_TIME_MS = 60_000;
const HALL_REFRESH_INTERVAL_MS = 30_000;

export const useHalls = (filters: HallFilters) => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.halls(user?.company?.id ?? '', filters),
    queryFn: ({ pageParam, signal }) => getHallsApi(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.meta.current_page < page.meta.last_page
        ? page.meta.current_page + 1
        : undefined,
    enabled: Boolean(user?.subscription?.active && user.role !== 'employee'),
    staleTime: HALL_STALE_TIME_MS,
    refetchInterval: HALL_REFRESH_INTERVAL_MS,
  });
};
export const useHall = (id?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planner.hall(user?.company?.id ?? '', id ?? ''),
    queryFn: ({ signal }) => getHallApi(id ?? '', signal),
    enabled: Boolean(
      id && user?.subscription?.active && user.role !== 'employee',
    ),
    staleTime: HALL_STALE_TIME_MS,
    refetchInterval: HALL_REFRESH_INTERVAL_MS,
  });
};
export const useHallMutations = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  const [sessionGeneration] = useState(getSessionGeneration);
  const invalidate = () => {
    if (sessionGeneration === getSessionGeneration())
      invalidatePlannerHall(client, user?.company?.id ?? '');
  };
  return {
    save: useMutation({ mutationFn: saveHallApi, onSuccess: invalidate }),
    status: useMutation({
      mutationFn: setHallStatusApi,
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: deleteHallApi, onSuccess: invalidate }),
  };
};
