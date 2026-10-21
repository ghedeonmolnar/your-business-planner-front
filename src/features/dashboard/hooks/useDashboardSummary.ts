import { useQuery } from '@tanstack/react-query';
import { getDashboardSummaryApi } from '@/features/dashboard/api/dashboardApi';
import { queryKeys } from '@/shared/api/queryKeys';
import { TIME_SENSITIVE_REFRESH_INTERVAL_MS } from '@/shared/api/queryRefresh';

export const useDashboardSummary = () =>
  useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: getDashboardSummaryApi,
    refetchInterval: TIME_SENSITIVE_REFRESH_INTERVAL_MS,
  });
