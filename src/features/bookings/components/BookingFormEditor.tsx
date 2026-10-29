import { useAuth } from '@/features/auth/AuthProvider';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import React, { useState } from 'react';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { Booking } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingEditorSchema } from '@/features/bookings/schemas/bookingEditorSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { BookingReviewFields } from '@/features/bookings/components/BookingReviewFields';
import { BookingScheduleFields } from '@/features/bookings/components/BookingScheduleFields';
import { BookingCommercialFields } from '@/features/bookings/components/BookingCommercialFields';
import { BookingStaffStep } from '@/features/bookings/components/BookingStaffStep';
import { useBookingSubmission } from '@/features/bookings/hooks/useBookingSubmission';
import { useBookingClientLookup } from '@/features/bookings/hooks/useBookingClientLookup';
import { useBookingHallDefaults } from '@/features/bookings/hooks/useBookingHallDefaults';
import {
  BookingCreationNotice,
  BookingCreationReconcileAction,
} from '@/features/bookings/components/BookingCreationNotice';
import { BookingCreationAttempt } from '@/features/bookings/utils/bookingCreationRecovery';
import { useDirectory } from '@/features/company/hooks/useCompany';
import { BookingClientFields } from '@/features/bookings/components/BookingClientFields';
import { DirectoryItem } from '@/features/company/types';
import { includeDirectorySelections } from '@/features/company/utils/includeDirectorySelections';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { FormActions } from '@/shared/components/FormActions';
import { bookingStepFields } from '@/features/bookings/utils/bookingFormErrors';
import { BookingConflictReview } from '@/features/bookings/components/BookingConflictReview';
import { validateBookingClientPhone } from '@/features/bookings/utils/bookingClientValidation';
import { companyNow } from '@/shared/utils/formatDate';

const allSteps = [
  'Sală și program',
  'Client',
  'Condiții comerciale',
  'Personal',
  'Recapitulare',
];
export type BookingFormProps = {
  date: string;
  hallId?: string;
  selectedHall?: DirectoryItem;
  booking?: Booking;
  onClose: () => void;
};
export function BookingFormEditor({
  date,
  hallId,
  selectedHall,
  booking: initialBooking,
  onClose,
  recoveredAttempt,
}: BookingFormProps & { recoveredAttempt?: BookingCreationAttempt }) {
  const [booking, setBooking] = useState(initialBooking);
  const [conflict, setConflict] = useState(false);
  const { user } = useAuth();
  const staffEnabled = Boolean(booking) && hasCompanyFeature(user, 'staff');
  const financeEnabled = hasCompanyFeature(user, 'finance');
  const owner = JSON.stringify([user?.company?.id, user?.id]);
  const [initialAttempt] = useState(recoveredAttempt);
  const today = companyNow().format('YYYY-MM-DD');
  const steps = staffEnabled
    ? allSteps
    : allSteps.filter(title => title !== 'Personal');
  const form = useAppForm<BookingFormValues>({
    resolver: zodResolver(bookingEditorSchema(booking, financeEnabled)),
    defaultValues:
      initialAttempt?.values ??
      bookingFormDefaults(
        !booking && date < today ? today : date,
        hallId,
        booking,
        selectedHall,
      ),
  });
  const [stepIndex, setStep] = useState(initialAttempt ? steps.length - 1 : 0);
  const step = Math.min(stepIndex, steps.length - 1);
  const halls = useDirectory('halls');
  const hallItems = includeDirectorySelections(
    halls.data?.pages.flatMap(page => page.items) ?? [],
    booking
      ? [
          {
            id: booking.hall_id,
            name: booking.hall_name ?? '',
            is_active: false,
          },
        ]
      : selectedHall
        ? [selectedHall]
        : [],
  );
  const values = form.watch();
  const onHallSelected = useBookingHallDefaults(
    form,
    hallItems,
    values.hall_id,
    booking,
    Boolean(initialAttempt),
  );
  const clientLookup = useBookingClientLookup(
    values.client_phone ?? '',
    step === 1,
  );
  const validateClientPhone = () => {
    const valid = validateBookingClientPhone(form, booking);
    if (!valid) setStep(1);
    return valid;
  };
  const save = useBookingSubmission({
    form,
    booking,
    owner,
    initialAttempt,
    staffEnabled,
    financeEnabled,
    validatePhone: validateClientPhone,
    onClose,
    onErrorStep: setStep,
    onConflict: () => setConflict(true),
  });
  const next = async () => {
    if (step === 1 && (clientLookup.checking || clientLookup.error)) return;
    if (step === 1 && !validateClientPhone()) return;
    if (await form.trigger(bookingStepFields(staffEnabled)[step])) {
      setStep(current => Math.min(current + 1, steps.length - 1));
    }
  };
  return (
    <FormModalFrame
      visible
      busy={save.isPending}
      readOnly={!booking && save.uncertain}
      title={steps[step]}
      progress={{ current: step + 1, total: steps.length }}
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <>
          {save.operationConflict ? (
            <BookingCreationReconcileAction
              onReconcile={save.reconcileCreation}
              busy={save.isPending}
            />
          ) : null}
          <FormActions
            busy={save.isPending}
            secondary={
              step > 0
                ? {
                    label: 'Înapoi',
                    variant: 'outline',
                    onPress: () => setStep(current => current - 1),
                  }
                : undefined
            }
            primary={{
              disabled:
                (step === steps.length - 1 && save.operationConflict) ||
                (step === 1 &&
                  Boolean(clientLookup.checking || clientLookup.error)),
              label:
                step === steps.length - 1 ? 'Salvează rezervarea' : 'Continuă',
              onPress: step === steps.length - 1 ? save.submit : next,
            }}
          />
        </>
      }
    >
      {!booking && save.uncertain ? (
        <BookingCreationNotice operationConflict={save.operationConflict} />
      ) : null}
      {conflict && booking ? (
        <BookingConflictReview
          bookingId={booking.id}
          onReload={current => {
            form.reset(
              bookingFormDefaults(current.date, current.hall_id, current),
            );
            setBooking(current);
            setConflict(false);
            setStep(0);
          }}
        />
      ) : null}
      {step === 0 ? (
        <BookingScheduleFields
          key={values.hall_id}
          form={form}
          halls={hallItems}
          hallId={values.hall_id}
          bookingId={booking?.id}
          hallsState={{
            loading: halls.isLoading,
            error: halls.error,
            onRetry: () => halls.refetch(),
            pagination: {
              hasMore: Boolean(halls.hasNextPage),
              loading: halls.isFetchingNextPage,
              error: halls.isFetchNextPageError ? halls.error : undefined,
              onLoadMore: () => halls.fetchNextPage(),
            },
          }}
          selectedHallId={booking?.hall_id}
          retainedType={booking?.type}
          onHallSelected={onHallSelected}
        />
      ) : null}
      {step === 1 ? (
        <BookingClientFields
          form={form}
          booking={booking}
          lookup={clientLookup}
        />
      ) : null}
      {step === 2 ? (
        <BookingCommercialFields
          form={form}
          editing={Boolean(booking)}
          booking={booking}
          financeEnabled={financeEnabled}
        />
      ) : null}
      {step === 3 && staffEnabled ? (
        <BookingStaffStep form={form} booking={booking} />
      ) : null}
      {step === steps.length - 1 ? (
        <BookingReviewFields
          form={form}
          booking={booking}
          hallName={hallItems.find(item => item.id === values.hall_id)?.name}
          clientName={
            clientLookup.data?.client?.name ||
            values.client_name?.trim() ||
            values.client_phone ||
            booking?.client_name
          }
        />
      ) : null}
    </FormModalFrame>
  );
}
