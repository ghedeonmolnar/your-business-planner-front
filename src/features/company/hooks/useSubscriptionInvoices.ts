import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getSubscriptionInvoicesApi,
  getSubscriptionInvoiceDownloadApi,
} from '@/features/company/api/subscriptionInvoicesApi';
import { queryKeys } from '@/shared/api/queryKeys';

export function useSubscriptionInvoices() {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.subscriptionInvoices(user?.company?.id ?? ''),
    queryFn: ({ pageParam, signal }) =>
      getSubscriptionInvoicesApi(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: user?.role === 'owner' && Boolean(user.subscription?.active),
    staleTime: 60_000,
  });
}

export const useSubscriptionInvoiceDownload = () =>
  useMutation({ mutationFn: getSubscriptionInvoiceDownloadApi });
