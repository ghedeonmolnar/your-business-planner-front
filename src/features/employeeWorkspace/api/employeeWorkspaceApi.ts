import { ApiPage, apiPageRequest, apiPaginatedRequest, apiRequest } from '@/shared/api/client';
import {
  EmployeeEvent,
  EmployeeAgendaSummary,
  EmployeeEventFilters,
  EmployeeStatistics,
} from '@/features/employeeWorkspace/types';
import {
  employeeAgendaSummarySchema,
  employeeEventSchema,
  employeeStatisticsSchema,
} from '@/features/employeeWorkspace/schemas/employeeWorkspaceApiSchemas';

const eventsPath = (filters: EmployeeEventFilters) => {
  const params = new URLSearchParams();

  if (filters.timeframe) params.set('timeframe', filters.timeframe);
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);

  const query = params.toString();

  return `/me/events${query ? `?${query}` : ''}`;
};

export const getEmployeeEventsPageApi = (
  filters: EmployeeEventFilters,
  page: number,
  perPage: number,
): Promise<ApiPage<EmployeeEvent>> =>
  apiPageRequest<EmployeeEvent>(eventsPath(filters), page, perPage, {
    itemSchema: employeeEventSchema,
  });

export const getEmployeeAgendaPageApi = (
  page: number,
  perPage: number,
): Promise<ApiPage<EmployeeEvent>> =>
  apiPageRequest<EmployeeEvent>('/me/agenda', page, perPage, {
    itemSchema: employeeEventSchema,
  });

export const getEmployeeAgendaSummaryApi = () =>
  apiRequest<EmployeeAgendaSummary>('/me/agenda-summary', {
    schema: employeeAgendaSummarySchema,
  });

export const getEmployeeEventsInRangeApi = (dateFrom: string, dateTo: string) =>
  apiPaginatedRequest<EmployeeEvent>(
    eventsPath({ date_from: dateFrom, date_to: dateTo }),
    { itemSchema: employeeEventSchema },
  );

export const getEmployeeEventApi = (id: string) =>
  apiRequest<EmployeeEvent>(`/me/events/${id}`, {
    schema: employeeEventSchema,
  });

export const getEmployeeStatisticsApi = (period: 'month' | 'all', month: string) =>
  apiRequest<EmployeeStatistics>(
    `/me/statistics?period=${period}${period === 'month' ? `&month=${month}` : ''}`,
    { schema: employeeStatisticsSchema },
  );
