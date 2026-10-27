import React from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useBookingCreationRecovery } from '@/features/bookings/hooks/useBookingCreationRecovery';
import {
  BookingFormEditor,
  type BookingFormProps,
} from '@/features/bookings/components/BookingFormEditor';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { LoadingState } from '@/shared/components/LoadingState';
import { FormModalFrame } from '@/shared/components/FormModalFrame';

function BookingRecoveryGate(props: BookingFormProps) {
  const { user } = useAuth();
  const owner = JSON.stringify([user?.company?.id, user?.id]);
  const recovery = useBookingCreationRecovery(owner, Boolean(props.booking));
  if (recovery.loading || recovery.error)
    return (
      <FormModalFrame
        visible
        title="Recuperarea rezervării"
        onClose={props.onClose}
      >
        {recovery.loading ? (
          <LoadingState />
        ) : (
          <ErrorBanner
            message="Nu am putut citi operațiunea salvată. Reîncearcă înainte de a crea o rezervare nouă."
            onRetry={recovery.retry}
          />
        )}
      </FormModalFrame>
    );
  return <BookingFormEditor {...props} recoveredAttempt={recovery.attempt} />;
}
export function BookingForm(props: BookingFormProps) {
  const { user } = useAuth();
  if (!user?.company?.id) return <LoadingState />;
  return (
    <BookingRecoveryGate
      key={JSON.stringify([user.company.id, user.id, props.booking?.id])}
      {...props}
    />
  );
}
