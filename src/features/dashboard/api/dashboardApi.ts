import { DashboardSummary } from '@/features/dashboard/types';
import { apiRequest } from '@/shared/api/client';
import { dashboardSummarySchema } from '@/features/dashboard/schemas/dashboardApiSchemas';

export const getDashboardSummaryApi = () =>
  apiRequest<DashboardSummary>('/dashboard-summary', {
    schema: dashboardSummarySchema,
  });
