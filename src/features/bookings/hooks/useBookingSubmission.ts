import { useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Booking } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { useSaveBooking } from '@/features/bookings/hooks/useBookings';
import {
  BookingCreationAttempt,
  forgetBookingCreationAttempt,
  rememberBookingCreationAttempt,
} from '@/features/bookings/utils/bookingCreationRecovery';
import { bookingPayload } from '@/features/bookings/utils/bookingFormValues';
import {
  applyBookingApiErrors,
  firstBookingErrorStep,
} from '@/features/bookings/utils/bookingFormErrors';
import { createOperationId } from '@/shared/utils/createOperationId';
import { ApiError, apiErrorCode } from '@/shared/api/apiError';
import { isDefinitiveBookingCreationFailure } from '@/features/bookings/utils/bookingCreationFailure';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { showError } from '@/shared/feedback/showError';

export const useBookingSubmission = ({
  form,
  booking,
  owner,
  initialAttempt,
  staffEnabled,
  validatePhone,
  onClose,
  onErrorStep,
  onConflict,
}: {
  form: UseFormReturn<BookingFormValues>;
  booking?: Booking;
  owner: string;
  initialAttempt?: BookingCreationAttempt;
  staffEnabled: boolean;
  validatePhone: () => boolean;
  onClose: () => void;
  onErrorStep: (step: number) => void;
  onConflict: () => void;
}) => {
  const mutation = useSaveBooking();
  const submitting = useRef(false);
  const attempt = useRef(initialAttempt);
  const [uncertain, setUncertain] = useState(Boolean(initialAttempt));
  const [operationConflict, setOperationConflict] = useState(
    Boolean(initialAttempt?.requiresReconciliation),
  );
  const [generation] = useState(getSessionGeneration);
  const save = async (values: BookingFormValues) => {
    if (
      submitting.current ||
      operationConflict ||
      generation !== getSessionGeneration()
    )
      return;
    if (!attempt.current && !validatePhone()) return;
    submitting.current = true;
    const recovering = Boolean(attempt.current);
    try {
      const formPayload = bookingPayload(values, booking);
      const payload = attempt.current?.payload ?? {
        ...formPayload,
        operation_id: booking ? undefined : createOperationId(),
        staff: staffEnabled ? formPayload.staff : undefined,
      };
      if (!booking) {
        attempt.current = { values, payload };
        rememberBookingCreationAttempt(owner, attempt.current);
        setUncertain(true);
      }
      await mutation.mutateAsync({ id: booking?.id, payload });
      if (generation !== getSessionGeneration()) return;
      if (!booking) forgetBookingCreationAttempt(owner);
      onClose();
    } catch (error) {
      if (generation !== getSessionGeneration()) return;
      const errorStep = applyBookingApiErrors(error, form, staffEnabled);
      if (errorStep !== null) onErrorStep(errorStep);
      if (error instanceof ApiError && error.status === 409 && booking)
        onConflict();
      if (
        !booking &&
        apiErrorCode(error) === 'BOOKING_OPERATION_CONFLICT' &&
        attempt.current
      ) {
        attempt.current.requiresReconciliation = true;
        rememberBookingCreationAttempt(owner, attempt.current);
        setOperationConflict(true);
      }
      if (
        !booking &&
        !recovering &&
        isDefinitiveBookingCreationFailure(error)
      ) {
        attempt.current = undefined;
        forgetBookingCreationAttempt(owner);
        setUncertain(false);
      }
      showError(error, 'Nu am putut salva rezervarea.');
    } finally {
      submitting.current = false;
    }
  };
  const submit = () =>
    attempt.current
      ? save(attempt.current.values)
      : form.handleSubmit(save, errors =>
          onErrorStep(firstBookingErrorStep(errors, staffEnabled)),
        )();
  const reconcileCreation = () => {
    if (
      !operationConflict ||
      submitting.current ||
      generation !== getSessionGeneration()
    )
      return;
    attempt.current = undefined;
    forgetBookingCreationAttempt(owner);
    setOperationConflict(false);
    setUncertain(false);
    onErrorStep(0);
  };
  return {
    submit,
    uncertain,
    operationConflict,
    reconcileCreation,
    isPending: mutation.isPending,
  };
};
