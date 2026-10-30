import React from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { needsBookingAdvanceReceipt } from '@/features/bookings/schemas/bookingEditorSchema';
import { Booking } from '@/features/bookings/types';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { FormPanel } from '@/shared/components/FormPanel';
import { ContentSection } from '@/shared/components/ContentSection';
import { companyNow } from '@/shared/utils/formatDate';

export function BookingAdvanceFields({
  form,
  booking,
  financeEnabled,
}: {
  form: UseFormReturn<BookingFormValues>;
  booking?: Booking;
  financeEnabled: boolean;
}) {
  const status = useWatch({ control: form.control, name: 'status' });
  const receivedAmount = useWatch({
    control: form.control,
    name: 'advance_received_amount',
  });
  const today = new Date(`${companyNow().format('YYYY-MM-DD')}T00:00:00`);
  if (status === 'tentative') {
    return (
      <FormPanel>
        <ContentSection
          title="Avans convenit · opțional"
          subtitle="Completează suma convenită și termenul până la care clientul o poate achita."
        />
        <ControlledTextField
          control={form.control}
          name="agreed_advance"
          label="Avans convenit (lei)"
          numeric
          placeholder="Opțional"
          keyboardType="decimal-pad"
        />
        <ControlledDateField
          control={form.control}
          name="advance_due_at"
          label="Scadența avansului"
          placeholder="Alege data"
          minimumDate={today}
        />
      </FormPanel>
    );
  }
  if (!financeEnabled || !['confirmed', 'completed'].includes(status))
    return null;
  const required = needsBookingAdvanceReceipt(booking);
  const receiptRequired =
    required || Number(receivedAmount?.replace(',', '.') || 0) > 0;
  return (
    <FormPanel>
      <ContentSection
        title="Avans primit"
        subtitle={
          required
            ? 'Înregistrează suma primită de la client.'
            : 'Completează doar dacă primești acum un avans nou. Încasările existente se păstrează.'
        }
      />
      <ControlledTextField
        control={form.control}
        name="advance_received_amount"
        label="Avans primit (lei)"
        required={required}
        numeric
        placeholder={required ? 'Introdu suma primită' : 'Opțional'}
        keyboardType="decimal-pad"
      />
      <ControlledSelectField
        control={form.control}
        name="advance_received_method"
        label="Metoda de încasare"
        required={receiptRequired}
        options={[
          { id: 'cash', name: 'Cash' },
          { id: 'card', name: 'Card' },
          { id: 'transfer', name: 'Transfer bancar' },
        ]}
        placeholder="Alege metoda"
        searchPlaceholder="Caută metoda"
        single
      />
      <ControlledDateField
        control={form.control}
        name="advance_received_at"
        label="Data încasării"
        required={receiptRequired}
        placeholder="Alege data"
        maximumDate={today}
      />
    </FormPanel>
  );
}
