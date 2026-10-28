import React from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  DatePickerField,
  DatePickerFieldProps,
} from '@/shared/components/DatePickerField';

type ControlledDateFieldProps<T extends FieldValues> = {
  control: Control<T, unknown, FieldValues>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  maximumDate?: Date;
  minimumDate?: Date;
  displayFormat?: DatePickerFieldProps['displayFormat'];
  style?: DatePickerFieldProps['style'];
  fieldStyle?: DatePickerFieldProps['fieldStyle'];
  disabled?: boolean;
  availability?: DatePickerFieldProps['availability'];
  onSelectionChange?: (value: string) => void;
};

export function ControlledDateField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  maximumDate,
  minimumDate,
  displayFormat,
  style,
  fieldStyle,
  disabled,
  availability,
  onSelectionChange,
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
          onChange={value => {
            onSelectionChange?.(value);
            onChange(value);
          }}
          placeholder={placeholder}
          value={value}
          displayFormat={displayFormat}
          style={style}
          fieldStyle={fieldStyle}
          disabled={disabled}
          availability={availability}
        />
      )}
    />
  );
}
