import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import {
  bookingServicePricingCopy,
  bookingServicePricingOptions,
} from '@/features/bookings/utils/bookingExtraServices';
import { bookingCommercialStyles as styles } from '@/features/bookings/components/bookingCommercialStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { Card } from '@/shared/components/Card';
import { IconButton } from '@/shared/components/IconButton';
import { theme } from '@/shared/theme/theme';

export function BookingExtraServiceCard({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<BookingFormValues>;
  index: number;
  onRemove: () => void;
}) {
  const pricingType = useWatch({
    control: form.control,
    name: `extra_services.${index}.pricing_type`,
  });
  const pricing = bookingServicePricingCopy(pricingType);
  return (
    <Card style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Ionicons
          accessible={false}
          name="add-circle-outline"
          size={theme.typography.title}
          color={theme.colors.menu.primary}
        />
        <Text
          style={styles.serviceTitle}
        >{`Serviciu suplimentar ${index + 1}`}</Text>
        <IconButton
          icon="trash-outline"
          accessibilityLabel={`Elimină serviciul ${index + 1}`}
          variant="ghost"
          onPress={onRemove}
        />
      </View>
      <ControlledTextField
        control={form.control}
        name={`extra_services.${index}.name`}
        required
        label="Denumire serviciu"
        placeholder="De exemplu: decor floral"
      />
      <ControlledSelectField
        control={form.control}
        name={`extra_services.${index}.pricing_type`}
        required
        label="Tip tarifare"
        single
        singleEmptyValue="fixed"
        options={bookingServicePricingOptions}
        placeholder="Preț unic"
        searchPlaceholder="Caută tipul tarifului"
      />
      <ControlledTextField
        control={form.control}
        name={`extra_services.${index}.amount`}
        required
        label={pricing.amountLabel}
        numeric
        placeholder="0,00"
        keyboardType="decimal-pad"
      />
      {pricing.hint ? <Text style={styles.hint}>{pricing.hint}</Text> : null}
    </Card>
  );
}
