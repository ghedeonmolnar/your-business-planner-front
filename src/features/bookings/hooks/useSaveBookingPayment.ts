import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { saveBookingPaymentApi } from '@/features/bookings/api/bookingFinanceApi';
import {
  loadPaymentOperations,
  rememberPaymentOperation,
  resolvePaymentOperation,
} from '@/features/bookings/utils/paymentOperationJournal';
import { queryKeys } from '@/shared/api/queryKeys';
import { invalidatePlannerPayments } from '@/shared/api/queryInvalidation';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';
import { ApiError } from '@/shared/api/apiError';

export const useSaveBookingPayment = (eventId: string) => {
  const { user } = useAuth();
  const client = useQueryClient();
  const companyId = user?.company?.id ?? '';
  const owner = JSON.stringify([companyId, user?.id]);
  const [generation] = useState(getSessionGeneration);
  const journalKey = queryKeys.planner.finance(
    companyId,
    eventId,
    'payment-journal',
  );
  const journal = useQuery({
    queryKey: journalKey,
    queryFn: () => loadPaymentOperations(owner, generation),
    enabled: Boolean(user),
    staleTime: 0,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: async (
      variables: Parameters<typeof saveBookingPaymentApi>[0],
    ) => {
      assertCurrentRequestSession(generation);
      const operationId = variables.payload.operation_id;
      let recovering = false;
      if (!variables.id) {
        const saved = await rememberPaymentOperation(
          owner,
          variables,
          generation,
        );
        assertCurrentRequestSession(generation);
        recovering = saved.recovering;
        client.setQueryData(journalKey, saved.operations);
      }
      try {
        const payment = await saveBookingPaymentApi(variables);
        if (!variables.id && operationId) {
          const operations = await resolvePaymentOperation(
            owner,
            operationId,
            generation,
          );
          assertCurrentRequestSession(generation);
          client.setQueryData(journalKey, operations);
        }
        assertCurrentRequestSession(generation);
        return payment;
      } catch (error) {
        if (
          !variables.id &&
          operationId &&
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500 &&
          error.status !== 409 &&
          !recovering &&
          generation === getSessionGeneration()
        ) {
          const operations = await resolvePaymentOperation(
            owner,
            operationId,
            generation,
          );
          assertCurrentRequestSession(generation);
          client.setQueryData(journalKey, operations);
        }
        throw error;
      }
    },
    onSuccess: payment => {
      if (generation === getSessionGeneration())
        invalidatePlannerPayments(client, companyId, payment.event_id);
    },
  });
  return {
    ...mutation,
    uncertainPayment: journal.data?.find(
      operation => operation.eventId === eventId,
    ),
    recoveryReady: journal.isSuccess,
    recoveryError: journal.error,
    retryRecovery: journal.refetch,
  };
};
