import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { UseFormReturn } from 'react-hook-form';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingCommercialStyles as styles } from '@/features/bookings/components/bookingCommercialStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { BookingFinalMenuFields } from '@/features/bookings/components/BookingFinalMenuFields';
import { theme } from '@/shared/theme/theme';

export function BookingMenuFields({
  form,
  editing = false,
}: {
  form: UseFormReturn<BookingFormValues>;
  editing?: boolean;
}) {
  const minimum = form.watch('minimum_guests');
  const status = form.watch('status');
  const confirmed = form.watch('final_guests');
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
      {editing ? <BookingFinalMenuFields form={form} /> : null}
    </>
  );
}
