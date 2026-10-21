import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { FormInput, formInputStyles } from '@/shared/components/FormInput';
import { theme } from '@/shared/theme/theme';

type ControlledSwitchFieldProps<T extends FieldValues> = {
  activeText: string;
  control: Control<T, unknown, FieldValues>;
  inactiveText: string;
  label: string;
  name: FieldPath<T>;
};

export function ControlledSwitchField<T extends FieldValues>({
  activeText,
  control,
  inactiveText,
  label,
  name,
}: ControlledSwitchFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormInput error={error?.message} label={label}>
          <View
            style={[
              formInputStyles.field,
              formInputStyles.fieldDimensions,
              styles.switchField,
              error ? formInputStyles.fieldError : undefined,
            ]}
          >
            <Text style={styles.valueText}>
              {value ? activeText : inactiveText}
            </Text>
            <Switch
              accessibilityLabel={label}
              onValueChange={onChange}
              value={Boolean(value)}
            />
          </View>
        </FormInput>
      )}
    />
  );
}

const styles = StyleSheet.create({
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.body,
  },
});
