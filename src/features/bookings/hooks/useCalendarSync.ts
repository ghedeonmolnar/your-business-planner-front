import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { getCalendarRevisionApi } from '@/features/bookings/api/bookingsApi';
import { reconcilePlannerCalendar } from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';
import { acquireCalendarSynchronization } from '@/features/bookings/utils/calendarSynchronization';

export function useCalendarSync(active: boolean) {
  const { user } = useAuth();
  const client = useQueryClient();
  const companyId = user?.company?.id ?? '';
  const enabled =
    active && Boolean(user?.subscription?.active && user.role !== 'employee');
  const [verificationBaseline, setVerificationBaseline] = useState(Infinity);
  const query = useQuery({
    queryKey: queryKeys.planner.calendarRevision(companyId),
    queryFn: ({ signal }) => getCalendarRevisionApi(signal),
    enabled: false,
    staleTime: 0,
    gcTime: 30 * 60_000,
  });
  const revision = query.data?.revision;
  const verified =
    !query.isError &&
    (client.getQueryState(queryKeys.planner.calendarRevision(companyId))
      ?.dataUpdateCount ?? 0) > verificationBaseline;
  useEffect(() => {
    if (enabled && verified && revision)
      reconcilePlannerCalendar(
        client,
        companyId,
        revision,
        query.data?.availability_revision,
      );
  }, [
    client,
    companyId,
    enabled,
    verified,
    revision,
    query.dataUpdatedAt,
    query.data?.availability_revision,
  ]);
  useEffect(() => {
    if (enabled) {
      setVerificationBaseline(
        client.getQueryState(queryKeys.planner.calendarRevision(companyId))
          ?.dataUpdateCount ?? 0,
      );
      return acquireCalendarSynchronization(client, companyId);
    }
    setVerificationBaseline(Infinity);
  }, [client, companyId, enabled, user?.id, user?.role]);
  return {
    ...query,
    verified,
  };
}
