import React from 'react';
import { Text } from 'react-native-paper';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingCommercialStyles as styles } from '@/features/bookings/components/bookingCommercialStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormPanel } from '@/shared/components/FormPanel';

export function BookingFinalMenuFields({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  const children = form.watch('child_guests');
  return (
    <>
      <ControlledTextField
        control={form.control}
        name="menu_name"
        label="Meniu ales (opțional)"
        placeholder="Denumirea meniului"
      />
      <ControlledTextField
        control={form.control}
        name="final_guests"
        label="Meniuri confirmate (opțional)"
        numeric
        placeholder="Numărul final de adulți"
        keyboardType="number-pad"
      />
      <Text style={styles.confirmationHint}>
        De obicei se completează cu aproximativ 7 zile înainte de eveniment.
        Până atunci, valoarea folosește estimarea și respectă minimul sălii.
      </Text>
      <FormPanel title="Meniuri copii · opțional">
        <Text style={styles.hint}>
          Se adaugă separat, la prețul pentru copii.
        </Text>
        <ControlledTextField
          control={form.control}
          name="child_guests"
          label="Număr meniuri copii (opțional)"
          numeric
          placeholder="Se poate completa ulterior"
          keyboardType="number-pad"
        />
        <ControlledTextField
          control={form.control}
          name="child_menu_price"
          label="Preț meniu copii (lei)"
          required={Number(children) > 0}
          numeric
          placeholder="Prețul convenit pentru un copil"
          keyboardType="decimal-pad"
        />
      </FormPanel>
    </>
  );
}
