import { AnalyticsYearReport } from '@/features/analytics/types';
import { apiRequest } from '@/shared/api/client';
import { analyticsYearReportSchema } from '@/features/analytics/schemas/analyticsApiSchemas';

export const getAnalyticsYearReportApi = (year: number) =>
  apiRequest<AnalyticsYearReport>(`/analytics-reports?year=${year}`, {
    schema: analyticsYearReportSchema,
  });
