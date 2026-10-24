import React from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormInput } from '@/shared/components/FormInput';
import { SearchableSelect } from '@/shared/components/select/SearchableSelect';
import {
  SelectOption,
  SelectOptionsState,
  SelectValue,
} from '@/shared/components/select/selectOptions';
import { IconName } from '@/shared/types/icon';

export type {
  SelectOption,
  SelectOptionsState,
  SelectValue,
} from '@/shared/components/select/selectOptions';
export { filterSelectOptions } from '@/shared/components/select/selectOptions';
export { SearchableSelect } from '@/shared/components/select/SearchableSelect';
export type { SearchableSelectProps } from '@/shared/components/select/SearchableSelect';

type ControlledSelectFieldProps<
  TFieldValues extends FieldValues,
  TValue extends SelectValue,
> = {
  control: Control<TFieldValues, unknown, FieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: SelectOption<TValue>[];
  placeholder: string;
  searchPlaceholder: string;
  noItemsText?: string;
  single?: boolean;
  singleEmptyValue?: TValue;
  disabled?: boolean;
  icon?: IconName;
  optionsState?: SelectOptionsState;
  onSelectionChange?: (values: TValue[]) => void;
};

export function ControlledSelectField<
  TFieldValues extends FieldValues,
  TValue extends SelectValue,
>({
  control,
  name,
  label,
  options,
  placeholder,
  searchPlaceholder,
  noItemsText = 'Nu există opțiuni',
  single = false,
  singleEmptyValue,
  disabled,
  icon,
  optionsState,
  onSelectionChange,
}: ControlledSelectFieldProps<TFieldValues, TValue>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        const selectedValues = Array.isArray(value)
          ? (value as TValue[])
          : value !== undefined && value !== null && value !== ''
            ? ([value] as TValue[])
            : [];
        return (
          <FormInput error={error?.message} label={label}>
            <SearchableSelect
              allowClear={!single || singleEmptyValue !== undefined}
              disabled={disabled}
              error={error?.message}
              icon={icon}
              optionsState={optionsState}
              label={label}
              noItemsText={noItemsText}
              onChange={nextValues => {
                onSelectionChange?.(nextValues);
                onChange(
                  single ? (nextValues[0] ?? singleEmptyValue) : nextValues,
                );
                onBlur();
              }}
              options={options}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              selectedValues={selectedValues}
              single={single}
            />
          </FormInput>
        );
      }}
    />
  );
}
