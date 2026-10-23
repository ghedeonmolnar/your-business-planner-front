import { useAuth } from '@/features/auth/AuthProvider';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Booking } from '@/features/bookings/types';
import {
  bookingFormSchema,
  BookingFormValues,
} from '@/features/bookings/schemas/bookingFormSchema';
import {
  bookingFormDefaults,
  bookingPayload,
} from '@/features/bookings/utils/bookingFormValues';
import { BookingReviewFields } from '@/features/bookings/components/BookingReviewFields';
import { BookingScheduleFields } from '@/features/bookings/components/BookingScheduleFields';
import { BookingCommercialFields } from '@/features/bookings/components/BookingCommercialFields';
import { BookingStaffStep } from '@/features/bookings/components/BookingStaffStep';
import { useSaveBooking } from '@/features/bookings/hooks/useBookings';
import { useDirectory } from '@/features/company/hooks/useCompany';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { BookingClientFields } from '@/features/bookings/components/BookingClientFields';
import { DirectoryItem } from '@/features/company/types';
import { includeDirectorySelections } from '@/features/company/utils/includeDirectorySelections';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { AppButton } from '@/shared/components/AppButton';
import { showError } from '@/shared/feedback/showError';
import {
  bookingStepFields,
  firstBookingErrorStep,
  applyBookingApiErrors,
} from '@/features/bookings/utils/bookingFormErrors';
import { BookingConflictReview } from '@/features/bookings/components/BookingConflictReview';
import { ApiError } from '@/shared/api/apiError';

const allSteps = [
  'Sală și program',
  'Client',
  'Condiții comerciale',
  'Personal',
  'Recapitulare',
];
export function BookingForm({
  date,
  hallId,
  selectedHall,
  booking: initialBooking,
  onClose,
}: {
  date: string;
  hallId?: string;
  selectedHall?: DirectoryItem;
  booking?: Booking;
  onClose: () => void;
}) {
  const [booking, setBooking] = useState(initialBooking);
  const [conflict, setConflict] = useState(false);
  const { user } = useAuth();
  const staffEnabled = hasCompanyFeature(user, 'staff');
  const steps = staffEnabled
    ? allSteps
    : allSteps.filter(title => title !== 'Personal');
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: bookingFormDefaults(date, hallId, booking),
  });
  const [stepIndex, setStep] = useState(0);
  const step = Math.min(stepIndex, steps.length - 1);
  const [selectedClient, setSelectedClient] = useState<DirectoryItem | null>(
    null,
  );
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
  const save = useSaveBooking();
  const submitting = useRef(false);
  const values = form.watch();
  const submit = form.handleSubmit(
    data => {
      if (submitting.current) {
        return;
      }
      submitting.current = true;
      save.mutate(
        { id: booking?.id, payload: bookingPayload(data, booking) },
        {
          onSuccess: onClose,
          onSettled: () => {
            submitting.current = false;
          },
          onError: error => {
            const errorStep = applyBookingApiErrors(error, form, staffEnabled);
            if (errorStep !== null) setStep(errorStep);
            if (error instanceof ApiError && error.status === 409)
              setConflict(true);
            showError(error, 'Nu am putut salva rezervarea.');
          },
        },
      );
    },
    errors => setStep(firstBookingErrorStep(errors, staffEnabled)),
  );
  const next = async () => {
    if (await form.trigger(bookingStepFields(staffEnabled)[step])) {
      setStep(current => Math.min(current + 1, steps.length - 1));
    }
  };
  return (
    <FormModalFrame
      visible
      busy={save.isPending}
      title={steps[step]}
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <View style={styles.row}>
          {step > 0 ? (
            <AppButton
              label="Înapoi"
              disabled={save.isPending}
              variant="outline"
              onPress={() => setStep(current => current - 1)}
            />
          ) : null}
          <AppButton
            label={
              step === steps.length - 1 ? 'Salvează rezervarea' : 'Continuă'
            }
            disabled={save.isPending}
            onPress={step === steps.length - 1 ? submit : next}
          />
        </View>
      }
    >
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
      <Text style={styles.muted}>
        Pasul {step + 1} din {steps.length} · Orele sunt în fusul României.
      </Text>
      {step === 0 ? (
        <>
          <QueryNotice
            loading={halls.isLoading}
            error={halls.error}
            retry={() => halls.refetch()}
          />
          <BookingScheduleFields
            control={form.control}
            halls={hallItems}
            selectedHallId={booking?.hall_id}
            retainedType={booking?.type}
          />
          {halls.hasNextPage ? (
            <AppButton
              label="Mai multe săli"
              disabled={halls.isFetchingNextPage}
              onPress={() => halls.fetchNextPage()}
            />
          ) : null}
        </>
      ) : null}
      {step === 1 ? (
        <BookingClientFields
          form={form}
          booking={booking}
          selectedClient={selectedClient}
          onSelected={setSelectedClient}
        />
      ) : null}
      {step === 2 ? <BookingCommercialFields form={form} /> : null}
      {step === 3 && staffEnabled ? (
        <BookingStaffStep form={form} booking={booking} />
      ) : null}
      {step === steps.length - 1 ? (
        <BookingReviewFields
          form={form}
          hallName={hallItems.find(item => item.id === values.hall_id)?.name}
          clientName={
            selectedClient?.id === values.client_id
              ? selectedClient.name
              : booking?.client_name
          }
        />
      ) : null}
    </FormModalFrame>
  );
}
