import React from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { DatePickerField } from '@/shared/components/DatePickerField';

type ControlledDateFieldProps<T extends FieldValues> = {
  control: Control<T, unknown, FieldValues>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  maximumDate?: Date;
  minimumDate?: Date;
};

export function ControlledDateField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  maximumDate,
  minimumDate,
}: ControlledDateFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onBlur, onChange, value },
        fieldState: { error },
      }) => (
        <DatePickerField
          error={error?.message}
          label={label}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
        />
      )}
    />
  );
}
