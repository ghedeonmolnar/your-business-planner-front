import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import {
  useInfiniteQuery,
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  cancelBookingPaymentApi,
  deleteBookingDocumentApi,
  getBookingDocumentsApi,
  getBookingDownloadApi,
  getBookingPaymentsApi,
  saveBookingPaymentApi,
  updateBookingDocumentApi,
  uploadBookingDocumentApi,
} from '@/features/bookings/api/bookingFinanceApi';
import { queryKeys } from '@/shared/api/queryKeys';
import { ApiError } from '@/shared/api/apiError';
import {
  invalidatePlannerDocuments,
  invalidatePlannerPayments,
} from '@/shared/api/queryInvalidation';

export const useBookingPayments = (id: string) => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.finance(
      user?.company?.id ?? '',
      id,
      'payments',
    ),
    queryFn: ({ pageParam, signal }) =>
      getBookingPaymentsApi(id, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: Boolean(
      user?.subscription?.active &&
      user.role !== 'employee' &&
      hasCompanyFeature(user, 'finance'),
    ),
  });
};
export const useBookingDocuments = (id: string) => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.finance(
      user?.company?.id ?? '',
      id,
      'documents',
    ),
    queryFn: ({ pageParam, signal }) =>
      getBookingDocumentsApi(id, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: Boolean(
      user?.subscription?.active &&
      user.role !== 'employee' &&
      hasCompanyFeature(user, 'documents'),
    ),
  });
};
const useCompanyQueryClient = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  return { client, companyId: user?.company?.id ?? '' };
};
export const useSaveBookingPayment = (eventId: string) => {
  const { client, companyId } = useCompanyQueryClient();
  const mutationKey = queryKeys.planner.finance(
    companyId,
    eventId,
    'payment-operations',
  );
  const uncertainPayments = useMutationState({
    filters: { mutationKey, status: 'error' },
    select: mutation => {
      const variables = mutation.state.variables as
        Parameters<typeof saveBookingPaymentApi>[0] | undefined;
      const error = mutation.state.error;
      const refused =
        error instanceof ApiError && error.status >= 400 && error.status < 500;
      return variables && !variables.id && !refused ? variables : null;
    },
  });
  const mutation = useMutation({
    mutationKey,
    gcTime: Infinity,
    mutationFn: saveBookingPaymentApi,
    onSuccess: (payment, variables) => {
      if (variables.payload.operation_id) {
        client
          .getMutationCache()
          .findAll({ mutationKey, status: 'error' })
          .forEach(attempt => {
            const previous = attempt.state.variables as
              Parameters<typeof saveBookingPaymentApi>[0] | undefined;
            if (
              previous?.payload.operation_id === variables.payload.operation_id
            ) {
              client.getMutationCache().remove(attempt);
            }
          });
      }
      invalidatePlannerPayments(client, companyId, payment.event_id);
    },
  });
  return {
    ...mutation,
    uncertainPayment: uncertainPayments.filter(item => item !== null).at(-1),
  };
};
export const useCancelBookingPayment = (eventId: string) => {
  const { client, companyId } = useCompanyQueryClient();
  return useMutation({
    mutationFn: cancelBookingPaymentApi,
    onSuccess: () => invalidatePlannerPayments(client, companyId, eventId),
  });
};
export const useUploadBookingDocument = () => {
  const { client, companyId } = useCompanyQueryClient();
  return useMutation({
    mutationFn: uploadBookingDocumentApi,
    onSuccess: document =>
      invalidatePlannerDocuments(client, companyId, document.event_id),
  });
};
export const useUpdateBookingDocument = () => {
  const { client, companyId } = useCompanyQueryClient();
  return useMutation({
    mutationFn: updateBookingDocumentApi,
    onSuccess: document =>
      invalidatePlannerDocuments(client, companyId, document.event_id),
  });
};
export const useDeleteBookingDocument = (eventId: string) => {
  const { client, companyId } = useCompanyQueryClient();
  return useMutation({
    mutationFn: deleteBookingDocumentApi,
    onSuccess: () => invalidatePlannerDocuments(client, companyId, eventId),
  });
};
export const useBookingDownload = () =>
  useMutation({ mutationFn: getBookingDownloadApi });
