import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { theme } from '@/shared/theme/theme';

type ControlledDateRangeFieldsProps<T extends FieldValues> = {
  control: Control<T, unknown, FieldValues>;
  fromName: FieldPath<T>;
  toName: FieldPath<T>;
};

export function ControlledDateRangeFields<T extends FieldValues>({
  control,
  fromName,
  toName,
}: ControlledDateRangeFieldsProps<T>) {
  const singleColumn = useSingleColumnLayout();
  return (
    <View style={[styles.row, singleColumn ? styles.column : undefined]}>
      <ControlledDateField
        control={control}
        name={fromName}
        label="De la"
        placeholder="Alege data"
        displayFormat="numeric"
        style={singleColumn ? undefined : styles.field}
      />
      <ControlledDateField
        control={control}
        name={toName}
        label="Până la"
        placeholder="Alege data"
        displayFormat="numeric"
        style={singleColumn ? undefined : styles.field}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.spacing.md },
  column: { flexDirection: 'column', gap: 0 },
  field: { flex: 1 },
});
