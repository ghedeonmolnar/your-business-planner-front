import React from 'react';
import { Control, FieldValues, FieldPath } from 'react-hook-form';
import { View, useWindowDimensions } from 'react-native';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import {
  hallWizardStyles as styles,
  HALL_FIELD_COLUMNS_MAX_FONT_SCALE,
} from '@/features/halls/components/hallWizardStyles';

export function HallMenuPriceFields<T extends FieldValues>({
  control,
  adultName,
  childName,
  required = false,
  inline = false,
}: {
  control: Control<T, unknown, FieldValues>;
  adultName: FieldPath<T>;
  childName: FieldPath<T>;
  required?: boolean;
  inline?: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  const columns = inline && fontScale <= HALL_FIELD_COLUMNS_MAX_FONT_SCALE;
  return (
    <View style={columns ? styles.row : styles.stack}>
      <View style={columns ? styles.responsiveField : undefined}>
        <ControlledTextField
          control={control}
          name={adultName}
          label={inline ? 'Adulți (lei)' : 'Preț meniu adulți (lei)'}
          required={required}
          placeholder="Nespecificat"
          numeric
          keyboardType="decimal-pad"
          leftIcon="restaurant-outline"
        />
      </View>
      <View style={columns ? styles.responsiveField : undefined}>
        <ControlledTextField
          control={control}
          name={childName}
          label={inline ? 'Copii (lei)' : 'Preț meniu copii (lei)'}
          required={required}
          placeholder="Nespecificat"
          numeric
          keyboardType="decimal-pad"
          leftIcon="restaurant-outline"
        />
      </View>
    </View>
  );
}
