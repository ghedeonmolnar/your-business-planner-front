import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { AppButton } from '@/shared/components/AppButton';

export function BookingCommercialFields({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  const extras = useFieldArray({
    control: form.control,
    name: 'extra_services',
  });
  return (
    <>
      <ControlledTextField
        control={form.control}
        name="minimum_guests"
        label="Număr minim garantat"
        placeholder="200"
        keyboardType="number-pad"
      />
      <ControlledTextField
        control={form.control}
        name="final_guests"
        label="Număr final de invitați"
        placeholder="Se completează ulterior"
        keyboardType="number-pad"
      />
      <ControlledTextField
        control={form.control}
        name="menu_name"
        label="Meniu agreat"
        placeholder="Denumire și condiții"
      />
      <ControlledTextField
        control={form.control}
        name="menu_price"
        label="Preț meniu / persoană (lei)"
        placeholder="350,00"
        keyboardType="decimal-pad"
      />
      <ControlledTextField
        control={form.control}
        name="agreed_advance"
        label="Avans convenit (lei)"
        placeholder="10000,00"
        keyboardType="decimal-pad"
      />
      <ControlledDateField
        control={form.control}
        name="advance_due_at"
        label="Scadența avansului"
        placeholder="Alege data"
      />
      {extras.fields.map((field, index) => (
        <React.Fragment key={field.id}>
          <ControlledTextField
            control={form.control}
            name={`extra_services.${index}.name` as const}
            label="Serviciu suplimentar"
            placeholder="Denumire"
          />
          <ControlledTextField
            control={form.control}
            name={`extra_services.${index}.amount` as const}
            label="Valoare serviciu (lei)"
            placeholder="0,00"
            keyboardType="decimal-pad"
          />
          <AppButton
            label="Elimină serviciul"
            variant="ghost"
            onPress={() => extras.remove(index)}
          />
        </React.Fragment>
      ))}
      <AppButton
        label="Adaugă serviciu"
        variant="outline"
        onPress={() => extras.append({ name: '', amount: '0' })}
      />
    </>
  );
}
