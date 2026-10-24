import { useAuth } from '@/features/auth/AuthProvider';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import React, { useRef, useState } from 'react';
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
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { BookingClientFields } from '@/features/bookings/components/BookingClientFields';
import { DirectoryItem } from '@/features/company/types';
import { includeDirectorySelections } from '@/features/company/utils/includeDirectorySelections';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { FormActions } from '@/shared/components/FormActions';
import { showError } from '@/shared/feedback/showError';
import {
  bookingStepFields,
  firstBookingErrorStep,
  applyBookingApiErrors,
} from '@/features/bookings/utils/bookingFormErrors';
import { BookingConflictReview } from '@/features/bookings/components/BookingConflictReview';
import { ApiError } from '@/shared/api/apiError';
import { buildContactUrl } from '@/shared/utils/contactLinks';

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
    defaultValues: bookingFormDefaults(
      date,
      hallId,
      booking,
      selectedHall?.minimum_guests,
    ),
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
  const validateClientPhone = () => {
    const clientId = form.getValues('client_id');
    if (
      booking?.client_id === clientId ||
      (selectedClient?.id === clientId &&
        buildContactUrl('call', selectedClient.phone))
    )
      return true;
    form.setError('client_id', {
      type: 'validate',
      message: 'Completează telefonul clientului înainte de rezervare.',
    });
    setStep(1);
    return false;
  };
  const submit = form.handleSubmit(
    data => {
      if (!validateClientPhone()) return;
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
    if (step === 1 && !validateClientPhone()) return;
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
            label:
              step === steps.length - 1 ? 'Salvează rezervarea' : 'Continuă',
            onPress: step === steps.length - 1 ? submit : next,
          }}
        />
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
          <BookingScheduleFields
            control={form.control}
            halls={hallItems}
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
            onHallSelected={id => {
              if (!booking && !form.getFieldState('minimum_guests').isDirty) {
                form.setValue(
                  'minimum_guests',
                  String(
                    hallItems.find(hall => hall.id === id)?.minimum_guests ?? 0,
                  ),
                );
              }
            }}
          />
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
