import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { getCalendarRevisionApi } from '@/features/bookings/api/bookingsApi';
import { reconcilePlannerCalendar } from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';

const REVISION_REFRESH_INTERVAL_MS = 30_000;

export function useCalendarSync(active: boolean) {
  const { user } = useAuth();
  const client = useQueryClient();
  const companyId = user?.company?.id ?? '';
  const enabled =
    active && Boolean(user?.subscription?.active && user.role !== 'employee');
  const query = useQuery({
    queryKey: queryKeys.planner.calendarRevision(companyId),
    queryFn: ({ signal }) => getCalendarRevisionApi(signal),
    enabled,
    staleTime: 0,
    refetchInterval: enabled ? REVISION_REFRESH_INTERVAL_MS : false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
  });
  const revision = query.data?.revision;
  useEffect(() => {
    if (enabled && revision)
      reconcilePlannerCalendar(client, companyId, revision);
  }, [client, companyId, enabled, revision, query.dataUpdatedAt]);
  return query;
}
