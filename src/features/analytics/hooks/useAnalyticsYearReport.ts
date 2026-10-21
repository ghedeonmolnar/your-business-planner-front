import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAnalyticsYearReportApi } from '@/features/analytics/api/analyticsApi';
import { queryKeys } from '@/shared/api/queryKeys';

export const useAnalyticsYearReport = (year: number) =>
  useQuery({
    queryKey: queryKeys.analytics.report(year),
    queryFn: () => getAnalyticsYearReportApi(year),
    placeholderData: keepPreviousData,
  });
