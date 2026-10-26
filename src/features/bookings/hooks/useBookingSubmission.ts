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
import { ApiError } from '@/shared/api/apiError';
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
  const [generation] = useState(getSessionGeneration);
  const save = async (values: BookingFormValues) => {
    if (submitting.current || generation !== getSessionGeneration()) return;
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
        !recovering &&
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 409
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
  return { submit, uncertain, isPending: mutation.isPending };
};
