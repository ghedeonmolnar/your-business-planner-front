import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { UseFormReturn } from 'react-hook-form';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingCommercialStyles as styles } from '@/features/bookings/components/bookingCommercialStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormPanel } from '@/shared/components/FormPanel';
import { theme } from '@/shared/theme/theme';

export function BookingMenuFields({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  const minimum = form.watch('minimum_guests');
  const status = form.watch('status');
  const confirmed = form.watch('final_guests');
  const children = form.watch('child_guests');
  return (
    <>
      <ControlledTextField
        control={form.control}
        name="estimated_guests"
        label="Meniuri estimate (adulți)"
        required={
          ['confirmed', 'completed'].includes(status) &&
          Number(minimum) < 1 &&
          !confirmed
        }
        numeric
        placeholder="Estimarea discutată cu clientul"
        keyboardType="number-pad"
      />
      <View style={styles.minimum}>
        <Ionicons
          accessible={false}
          name="information-circle-outline"
          size={theme.typography.subtitle}
          color={theme.colors.menu.muted}
        />
        <Text style={styles.hint}>
          Minimul sălii:{' '}
          {Number(minimum) > 0
            ? `${minimum} meniuri pentru adulți`
            : 'nespecificat'}
        </Text>
      </View>
      <ControlledTextField
        control={form.control}
        name="menu_price"
        required
        label="Preț meniu adulți (lei)"
        numeric
        placeholder="Prețul convenit pentru un adult"
        keyboardType="decimal-pad"
      />
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
