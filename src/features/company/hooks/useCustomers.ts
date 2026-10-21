import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getCustomerApi,
  getCustomersApi,
} from '@/features/company/api/customersApi';
import { CustomerFilters } from '@/features/company/types';
import { queryKeys } from '@/shared/api/queryKeys';

export function useCustomers(filters: CustomerFilters) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.directory(
      user?.company?.id ?? '',
      'clients',
      filters,
    ),
    queryFn: ({ pageParam, signal }) =>
      getCustomersApi(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: Boolean(user?.subscription?.active && user.role !== 'employee'),
    staleTime: 30_000,
  });
}

export function useCustomer(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planner.customer(user?.company?.id ?? '', id),
    queryFn: ({ signal }) => getCustomerApi(id, signal),
    enabled: Boolean(
      id && user?.subscription?.active && user.role !== 'employee',
    ),
    staleTime: 30_000,
  });
}
