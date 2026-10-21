import React from 'react';
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from 'react-hook-form';
import { DatePickerField } from '@/shared/components/DatePickerField';
import { buildBirthDate, splitBirthDate } from '@/shared/utils/birthDate';

type ControlledBirthDateFieldProps<T extends FieldValues> = {
  control: Control<T, unknown, FieldValues>;
  dayName: FieldPath<T>;
  label: string;
  monthName: FieldPath<T>;
  yearName: FieldPath<T>;
};

const minimumBirthYear = 1900;
const minimumBirthDate = new Date(minimumBirthYear, 0, 1);

export function ControlledBirthDateField<T extends FieldValues>({
  control,
  dayName,
  label,
  monthName,
  yearName,
}: ControlledBirthDateFieldProps<T>) {
  const yearController = useController({ control, name: yearName });
  const monthController = useController({ control, name: monthName });
  const dayController = useController({ control, name: dayName });
  const year = String(yearController.field.value ?? '');
  const month = String(monthController.field.value ?? '');
  const day = String(dayController.field.value ?? '');
  const error =
    yearController.fieldState.error?.message ??
    monthController.fieldState.error?.message ??
    dayController.fieldState.error?.message;
  const value = buildBirthDate(year, month, day) ?? '';

  const changeDate = (date: string) => {
    const parts = splitBirthDate(date);

    yearController.field.onChange(parts.year);
    monthController.field.onChange(parts.month);
    dayController.field.onChange(parts.day);
  };

  const blur = () => {
    yearController.field.onBlur();
    monthController.field.onBlur();
    dayController.field.onBlur();
  };

  return (
    <DatePickerField
      error={error}
      label={label}
      maximumDate={new Date()}
      minimumDate={minimumBirthDate}
      onBlur={blur}
      onChange={changeDate}
      placeholder="Alege data nașterii"
      value={value}
    />
  );
}
