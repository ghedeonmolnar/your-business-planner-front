import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingCommercialStyles as styles } from '@/features/bookings/components/bookingCommercialStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { Card } from '@/shared/components/Card';
import { IconButton } from '@/shared/components/IconButton';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';
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
        <Card key={field.id} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <Ionicons
              accessible={false}
              name="add-circle-outline"
              size={theme.typography.title}
              color={theme.colors.menu.primary}
            />
            <Text style={styles.serviceTitle}>
              Serviciu suplimentar {index + 1}
            </Text>
            <IconButton
              icon="trash-outline"
              accessibilityLabel={`Elimină serviciul ${index + 1}`}
              variant="ghost"
              onPress={() => extras.remove(index)}
            />
          </View>
          <ControlledTextField
            control={form.control}
            name={`extra_services.${index}.name`}
            required
            label="Denumire serviciu"
            placeholder="De exemplu: decor floral"
          />
          <ControlledTextField
            control={form.control}
            name={`extra_services.${index}.amount`}
            required
            label="Valoare serviciu (lei)"
            numeric
            placeholder="0,00"
            keyboardType="decimal-pad"
          />
        </Card>
      ))}
      <AppButton
        label="Adaugă serviciu"
        icon="add-outline"
        variant="outline"
        disabled={extras.fields.length >= MAX_EXTRA_SERVICES}
        onPress={() => extras.append({ name: '', amount: '0' })}
      />
    </View>
  );
}
