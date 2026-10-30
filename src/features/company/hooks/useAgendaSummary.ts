import { useEffect } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAgendaClock } from '@/features/company/hooks/useAgendaClock';
import {
  getAgendaItemsApi,
  getAgendaSummaryApi,
} from '@/features/company/api/agendaApi';
import { AgendaView } from '@/features/company/schemas/agendaSchemas';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { queryKeys } from '@/shared/api/queryKeys';
import { companyNow } from '@/shared/utils/formatDate';

const AGENDA_REFRESH_INTERVAL_MS = 60_000;
const AGENDA_STALE_TIME_MS = 30_000;

function useAgendaAccess(financial = false) {
  const { user } = useAuth();
  const { now, focused } = useAgendaClock();
  const finance = hasCompanyFeature(user, 'finance');
  return {
    companyId: user?.company?.id ?? '',
    date: companyNow(now).format('YYYY-MM-DD'),
    focused,
    finance,
    enabled: Boolean(
      focused &&
      user?.company &&
      user.subscription?.active &&
      user.role !== 'employee' &&
      (!financial || finance),
    ),
  };
}

export function useAgendaSummary() {
  const access = useAgendaAccess();
  const query = useQuery({
    queryKey: queryKeys.planner.agendaSummary(
      access.companyId,
      access.date,
      access.finance,
    ),
    queryFn: ({ signal }) => getAgendaSummaryApi(signal),
    enabled: access.enabled,
    staleTime: AGENDA_STALE_TIME_MS,
    refetchInterval: access.focused ? AGENDA_REFRESH_INTERVAL_MS : false,
  });
  const { refetch } = query;
  useEffect(() => {
    if (access.enabled) void refetch();
  }, [access.enabled, refetch]);
  return query;
}

export function useAgendaItems(view: AgendaView, month: string) {
  const access = useAgendaAccess(view === 'received' || view === 'due');
  const query = useInfiniteQuery({
    queryKey: queryKeys.planner.agendaItems(
      access.companyId,
      view,
      month,
      access.date,
      access.finance,
    ),
    queryFn: ({ pageParam, signal }) =>
      getAgendaItemsApi(view, month, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: access.enabled,
    staleTime: AGENDA_STALE_TIME_MS,
  });
  const { refetch } = query;
  useEffect(() => {
    if (access.enabled) void refetch();
  }, [access.enabled, refetch]);
  return query;
}

export function useRefreshAgendaSummary() {
  const client = useQueryClient();
  const { user } = useAuth();
  return () =>
    client.refetchQueries({
      queryKey: queryKeys.planner.overviews(user?.company?.id ?? ''),
      type: 'active',
    });
}
