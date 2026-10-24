import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { FormInput, formInputStyles } from '@/shared/components/FormInput';
import { theme } from '@/shared/theme/theme';
import { useFormBusy } from '@/shared/components/FormInteractionContext';

type ControlledSwitchFieldProps<T extends FieldValues> = {
  activeText: string;
  control: Control<T, unknown, FieldValues>;
  inactiveText: string;
  label: string;
  name: FieldPath<T>;
  disabled?: boolean;
};

export function ControlledSwitchField<T extends FieldValues>({
  activeText,
  control,
  inactiveText,
  label,
  name,
  disabled = false,
}: ControlledSwitchFieldProps<T>) {
  const busy = useFormBusy();
  const blocked = disabled || busy;
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
              blocked ? formInputStyles.fieldDisabled : undefined,
            ]}
          >
            <Text style={styles.valueText}>
              {value ? activeText : inactiveText}
            </Text>
            <Switch
              accessibilityLabel={label}
              disabled={blocked}
              onValueChange={nextValue => {
                if (!blocked) onChange(nextValue);
              }}
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
    gap: theme.spacing.md,
  },
  valueText: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.body,
  },
});
