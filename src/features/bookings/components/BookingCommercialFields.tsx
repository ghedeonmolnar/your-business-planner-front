import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { Booking } from '@/features/bookings/types';
import { BookingAdvanceFields } from '@/features/bookings/components/BookingAdvanceFields';
import { BookingMenuFields } from '@/features/bookings/components/BookingMenuFields';
import { BookingExtraServices } from '@/features/bookings/components/BookingExtraServices';

export function BookingCommercialFields({
  form,
  editing = false,
  booking,
  financeEnabled = true,
}: {
  form: UseFormReturn<BookingFormValues>;
  editing?: boolean;
  booking?: Booking;
  financeEnabled?: boolean;
}) {
  return (
    <>
      <BookingMenuFields form={form} editing={editing} />
      <BookingAdvanceFields
        form={form}
        booking={booking}
        financeEnabled={financeEnabled}
      />
      <BookingExtraServices form={form} />
    </>
  );
}
