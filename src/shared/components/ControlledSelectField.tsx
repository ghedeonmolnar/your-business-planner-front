import React, { useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormInput } from '@/shared/components/FormInput';
import {
  SelectFieldTrigger,
  selectFieldStyles,
} from '@/shared/components/select/SelectFieldTrigger';
import { SelectOptionsModal } from '@/shared/components/select/SelectOptionsModal';
import {
  SelectOption,
  SelectValue,
} from '@/shared/components/select/selectOptions';

export type { SelectOption, SelectValue };
export { filterSelectOptions } from '@/shared/components/select/selectOptions';

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
  onSelectionChange?: (values: TValue[]) => void;
};

export type SearchableSelectProps<TValue extends SelectValue> = {
  allowClear: boolean;
  disabled?: boolean;
  error?: string;
  label: string;
  noItemsText: string;
  onChange: (selectedValues: TValue[]) => void;
  options: SelectOption<TValue>[];
  placeholder: string;
  searchPlaceholder: string;
  selectedValues: TValue[];
  single: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SearchableSelect<TValue extends SelectValue>({
  allowClear,
  disabled,
  error,
  label,
  noItemsText,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  selectedValues,
  single,
  style,
}: SearchableSelectProps<TValue>) {
  const [isOpen, setOpen] = useState(false);
  const selectedOptions = options.filter(option =>
    selectedValues.includes(option.id),
  );
  const displayValue = selectedOptions.map(option => option.name).join(', ');
  const hasSelection = selectedValues.length > 0;

  const open = () => {
    if (disabled) {
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <SelectFieldTrigger
        style={style}
        accessibilityLabel={label}
        accessibilityValueText={displayValue || placeholder}
        disabled={disabled}
        expanded={isOpen}
        hasError={Boolean(error)}
        onClear={allowClear && hasSelection ? () => onChange([]) : undefined}
        onPress={open}
        placeholder={placeholder}
      >
        {displayValue ? (
          <Text numberOfLines={1} style={selectFieldStyles.value}>
            {displayValue}
          </Text>
        ) : null}
      </SelectFieldTrigger>

      <SelectOptionsModal
        allowClear={allowClear}
        label={label}
        noItemsText={noItemsText}
        onChange={onChange}
        onClose={() => setOpen(false)}
        options={options}
        searchPlaceholder={searchPlaceholder}
        selectedValues={selectedValues}
        single={single}
        visible={isOpen}
      />
    </>
  );
}

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
  onSelectionChange,
}: ControlledSelectFieldProps<TFieldValues, TValue>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
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
              label={label}
              noItemsText={noItemsText}
              onChange={nextValues => {
                onSelectionChange?.(nextValues);
                if (single) {
                  onChange(nextValues[0] ?? singleEmptyValue);
                  return;
                }

                onChange(nextValues);
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
