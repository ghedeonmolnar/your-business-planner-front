import React from 'react';
import { useSaveBookingPayment } from '@/features/bookings/hooks/useSaveBookingPayment';
import { BookingPayment } from '@/features/bookings/schemas/bookingFinanceSchemas';
import { BookingPaymentEditor } from '@/features/bookings/components/BookingPaymentEditor';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { QueryState } from '@/shared/components/QueryState';
import { LoadingState } from '@/shared/components/LoadingState';

export function BookingPaymentForm({
  eventId,
  payment,
  onClose,
}: {
  eventId: string;
  payment?: BookingPayment;
  onClose: () => void;
}) {
  const mutation = useSaveBookingPayment(eventId);
  if (!payment && !mutation.recoveryReady) {
    if (!mutation.recoveryError) return <LoadingState />;
    return (
      <FormModalFrame visible title="Încasare sau cheltuială" onClose={onClose}>
        <QueryState
          loading={false}
          error={mutation.recoveryError}
          retry={() => mutation.retryRecovery()}
        />
      </FormModalFrame>
    );
  }
  return (
    <BookingPaymentEditor
      eventId={eventId}
      payment={payment}
      onClose={onClose}
      mutation={mutation}
    />
  );
}
