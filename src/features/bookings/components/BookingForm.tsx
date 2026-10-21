import { useAuth } from '@/features/auth/AuthProvider';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { FieldPath, useForm } from 'react-hook-form';
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
import { BookingStaffFields } from '@/features/bookings/components/BookingStaffFields';
import { useSaveBooking } from '@/features/bookings/hooks/useBookings';
import {
  useDirectory,
  useStaffAvailability,
} from '@/features/company/hooks/useCompany';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { BookingClientFields } from '@/features/bookings/components/BookingClientFields';
import { DirectoryItem } from '@/features/company/types';
import { includeDirectorySelections } from '@/features/company/utils/includeDirectorySelections';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { AppButton } from '@/shared/components/AppButton';
import { toCompanyTimestamp } from '@/shared/utils/formatDate';
import { showError } from '@/shared/feedback/showError';

const allSteps = [
  'Sală și program',
  'Client',
  'Condiții comerciale',
  'Personal',
  'Recapitulare',
];
const stepFields: FieldPath<BookingFormValues>[][] = [
  ['hall_id', 'date', 'type', 'status', 'starts_at', 'ends_at', 'expires_at'],
  ['client_id'],
  [
    'minimum_guests',
    'final_guests',
    'menu_price',
    'menu_name',
    'agreed_advance',
    'extra_services',
  ],
  ['staff'],
];

export function BookingForm({
  date,
  hallId,
  booking,
  onClose,
}: {
  date: string;
  hallId?: string;
  booking?: Booking;
  onClose: () => void;
}) {
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
  const employees = useDirectory('employees');
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
      : [],
  );
  const save = useSaveBooking();
  const values = form.watch();
  const availability = useStaffAvailability(
    toCompanyTimestamp(values.starts_at),
    toCompanyTimestamp(values.ends_at),
    booking?.id,
  );
  const staffQuery =
    values.starts_at && values.ends_at ? availability : employees;
  const submit = form.handleSubmit(
    data => {
      save.mutate(
        { id: booking?.id, payload: bookingPayload(data) },
        {
          onSuccess: onClose,
          onError: error => showError(error, 'Nu am putut salva rezervarea.'),
        },
      );
    },
    () => setStep(0),
  );
  const next = async () => {
    if (await form.trigger(stepFields[step])) {
      setStep(current => Math.min(current + 1, steps.length - 1));
    }
  };
  return (
    <FormModalFrame
      visible
      title={steps[step]}
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <View style={styles.row}>
          {step > 0 ? (
            <AppButton
              label="Înapoi"
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
        <>
          <QueryNotice
            loading={staffQuery.isLoading}
            error={staffQuery.error}
            retry={() => staffQuery.refetch()}
          />
          <BookingStaffFields
            form={form}
            employees={includeDirectorySelections(
              staffQuery.data?.pages.flatMap(page => page.items) ?? [],
              booking?.staff.map(person => ({
                id: person.employee_id,
                name: person.employee_name ?? '',
                is_active: false,
              })) ?? [],
            )}
          />
          {staffQuery.hasNextPage ? (
            <AppButton
              label="Mai multe persoane"
              disabled={staffQuery.isFetchingNextPage}
              onPress={() => staffQuery.fetchNextPage()}
            />
          ) : null}
        </>
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
