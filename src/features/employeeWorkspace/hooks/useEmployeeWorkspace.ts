import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  getEmployeeEventApi,
  getEmployeeAgendaPageApi,
  getEmployeeAgendaSummaryApi,
  getEmployeeEventsInRangeApi,
  getEmployeeEventsPageApi,
  getEmployeeStatisticsApi,
} from '@/features/employeeWorkspace/api/employeeWorkspaceApi';
import { EmployeeEventFilters } from '@/features/employeeWorkspace/types';
import { reminderWindowRange } from '@/shared/utils/reminderWindow';
import { queryKeys } from '@/shared/api/queryKeys';

const PAGE_SIZE = 20;

export const useEmployeeEventsList = (filters: EmployeeEventFilters, enabled = true) =>
  useInfiniteQuery({
    queryKey: queryKeys.employeeWorkspace.list(filters),
    queryFn: ({ pageParam }) => getEmployeeEventsPageApi(filters, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    enabled,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.lastPage ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });

export const useEmployeeAgenda = () =>
  useInfiniteQuery({
    queryKey: queryKeys.employeeWorkspace.agenda,
    queryFn: ({ pageParam }) => getEmployeeAgendaPageApi(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.lastPage ? lastPage.page + 1 : undefined,
  });

export const useEmployeeAgendaSummary = () =>
  useQuery({
    queryKey: queryKeys.employeeWorkspace.agendaSummary,
    queryFn: getEmployeeAgendaSummaryApi,
  });

export const useEmployeeMonthEvents = (month: string, enabled = true) => {
  const from = dayjs(`${month}-01`).startOf('month').format('YYYY-MM-DD');
  const to = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD');

  return useQuery({
    queryKey: queryKeys.employeeWorkspace.month(month),
    queryFn: () => getEmployeeEventsInRangeApi(from, to),
    enabled,
  });
};

export const useEmployeeReminderEvents = (enabled: boolean) => {
  const { dateFrom, dateTo } = reminderWindowRange();

  return useQuery({
    queryKey: queryKeys.employeeWorkspace.reminderWindow(dateFrom, dateTo),
    queryFn: () => getEmployeeEventsInRangeApi(dateFrom, dateTo),
    enabled,
  });
};

export const useEmployeeEvent = (id: string) =>
  useQuery({
    queryKey: queryKeys.employeeWorkspace.detail(id),
    queryFn: () => getEmployeeEventApi(id),
  });

export const useEmployeeStatistics = (period: 'month' | 'all', month: string) =>
  useQuery({
    queryKey: queryKeys.employeeWorkspace.statistics(period, period === 'all' ? 'all' : month),
    queryFn: () => getEmployeeStatisticsApi(period, month),
  });
