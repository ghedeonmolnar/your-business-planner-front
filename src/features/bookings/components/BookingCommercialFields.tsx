import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { BookingMenuFields } from '@/features/bookings/components/BookingMenuFields';
import { BookingExtraServices } from '@/features/bookings/components/BookingExtraServices';
import { FormPanel } from '@/shared/components/FormPanel';

export function BookingCommercialFields({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  return (
    <>
      <BookingMenuFields form={form} />
      <FormPanel title="Avans">
        <ControlledTextField
          control={form.control}
          name="agreed_advance"
          required
          label="Avans convenit (lei)"
          numeric
          placeholder="10000,00"
          keyboardType="decimal-pad"
        />
        <ControlledDateField
          control={form.control}
          name="advance_due_at"
          label="Scadența avansului"
          placeholder="Alege data"
        />
      </FormPanel>
      <BookingExtraServices form={form} />
    </>
  );
}
