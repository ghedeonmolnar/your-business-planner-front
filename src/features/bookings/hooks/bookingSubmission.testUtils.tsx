import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthProvider';
import { useBookingSubmission } from '@/features/bookings/hooks/useBookingSubmission';
import {
  BookingFormValues,
  bookingFormSchema,
} from '@/features/bookings/schemas/bookingFormSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { getBookingCreationAttempt } from '@/features/bookings/utils/bookingCreationRecovery';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import {
  BookingCreationNotice,
  BookingCreationReconcileAction,
} from '@/features/bookings/components/BookingCreationNotice';
import { AppButton } from '@/shared/components/AppButton';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
export const owner = JSON.stringify([
  plannerAccount.company?.id,
  plannerAccount.id,
]);
export const press = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) =>
  ReactTestRenderer.act(async () =>
    renderer.root.findByProps({ accessibilityLabel: label }).props.onPress(),
  );

export function Probe({
  onClose,
  date = plannerBooking.date,
}: {
  onClose: () => void;
  date?: string;
}) {
  const { user } = useAuth();
  const recovered = getBookingCreationAttempt(owner);
  const defaults = bookingFormDefaults(
    plannerBooking.date,
    plannerBooking.hall_id,
    plannerBooking,
  );
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: recovered?.values ?? {
      ...defaults,
      date,
      staff: [
        {
          employee_id: 'employee-A',
          job_role: 'waiter',
          pay_type: 'fixed',
          rate: '40.00',
          starts_at: defaults.starts_at,
          ends_at: defaults.ends_at,
        },
      ],
    },
  });
  const save = useBookingSubmission({
    form,
    owner,
    initialAttempt: recovered,
    staffEnabled: true,
    validatePhone: () => true,
    onClose,
    onErrorStep: () => undefined,
    onConflict: () => undefined,
  });
  return (
    <FormModalFrame
      visible
      readOnly={save.uncertain}
      busy={save.isPending}
      title="Creare"
      onClose={() => undefined}
      footer={
        <>
          {save.operationConflict ? (
            <BookingCreationReconcileAction
              onReconcile={save.reconcileCreation}
            />
          ) : null}
          <AppButton
            label="Trimite"
            onPress={save.submit}
            disabled={!user || save.operationConflict}
          />
        </>
      }
    >
      <Text>
        {form.watch('date')} · {form.watch('hall_id')}
      </Text>
      <AppButton
        label="Schimbă sala"
        disabled={save.uncertain}
        onPress={() => form.setValue('hall_id', 'hall-B')}
      />
      <AppButton
        label="Schimbă persoana"
        disabled={save.uncertain}
        onPress={() => form.setValue('staff.0.employee_id', 'employee-B')}
      />
      {save.uncertain ? (
        <BookingCreationNotice operationConflict={save.operationConflict} />
      ) : null}
    </FormModalFrame>
  );
}
