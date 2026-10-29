import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingCommercialStyles as styles } from '@/features/bookings/components/bookingCommercialStyles';
import { BookingExtraServiceCard } from '@/features/bookings/components/BookingExtraServiceCard';
import { AppButton } from '@/shared/components/AppButton';
import { MAX_EXTRA_SERVICES } from '@/features/bookings/utils/bookingFormLimits';

export function BookingExtraServices({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  const extras = useFieldArray({
    control: form.control,
    name: 'extra_services',
  });
  return (
    <View style={styles.services}>
      <Text accessibilityRole="header" style={styles.title}>
        Servicii suplimentare
      </Text>
      <Text style={styles.hint}>
        Opționale, adăugate la valoarea meniurilor.
      </Text>
      {extras.fields.map((field, index) => (
        <BookingExtraServiceCard
          key={field.id}
          form={form}
          index={index}
          onRemove={() => extras.remove(index)}
        />
      ))}
      <AppButton
        label="Adaugă serviciu"
        icon="add-outline"
        variant="outline"
        disabled={extras.fields.length >= MAX_EXTRA_SERVICES}
        onPress={() =>
          extras.append({ name: '', amount: '0', pricing_type: 'fixed' })
        }
      />
    </View>
  );
}
