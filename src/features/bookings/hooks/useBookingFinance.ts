import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import {
  useInfiniteQuery,
  useMutation,
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
export const useSaveBookingPayment = () => {
  const { client, companyId } = useCompanyQueryClient();
  return useMutation({
    mutationFn: saveBookingPaymentApi,
    onSuccess: payment =>
      invalidatePlannerPayments(client, companyId, payment.event_id),
  });
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
