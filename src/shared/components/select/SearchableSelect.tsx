import React, { useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import {
  SelectFieldTrigger,
  selectFieldStyles,
} from '@/shared/components/select/SelectFieldTrigger';
import { SelectOptionsModal } from '@/shared/components/select/SelectOptionsModal';
import {
  SelectOption,
  SelectOptionsState,
  SelectValue,
} from '@/shared/components/select/selectOptions';
import { IconName } from '@/shared/types/icon';

export type SearchableSelectProps<TValue extends SelectValue> = {
  allowClear: boolean;
  multiline?: boolean;
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
  icon?: IconName;
  optionsState?: SelectOptionsState;
};

export function SearchableSelect<TValue extends SelectValue>({
  allowClear,
  multiline = false,
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
  icon,
  optionsState,
}: SearchableSelectProps<TValue>) {
  const busy = useFormBusy();
  const blocked = Boolean(disabled || busy);
  const [isOpen, setOpen] = useState(false);
  const selectedOptions = options.filter(option =>
    selectedValues.includes(option.id),
  );
  const displayValue = selectedOptions.map(option => option.name).join(', ');
  const change = (values: TValue[]) => {
    if (!blocked) onChange(values);
  };
  return (
    <>
      <SelectFieldTrigger
        style={style}
        accessibilityLabel={label}
        accessibilityValueText={displayValue || placeholder}
        disabled={blocked}
        expanded={isOpen}
        hasError={Boolean(error)}
        icon={icon}
        onClear={
          allowClear && selectedValues.length > 0 ? () => change([]) : undefined
        }
        onPress={() => {
          if (!blocked) setOpen(true);
        }}
        placeholder={placeholder}
      >
        {displayValue ? (
          <Text
            numberOfLines={multiline ? undefined : 1}
            style={selectFieldStyles.value}
          >
            {displayValue}
          </Text>
        ) : null}
      </SelectFieldTrigger>
      <SelectOptionsModal
        allowClear={allowClear}
        label={label}
        noItemsText={noItemsText}
        onChange={change}
        onClose={() => setOpen(false)}
        options={options}
        searchPlaceholder={searchPlaceholder}
        selectedValues={selectedValues}
        single={single}
        visible={isOpen}
        disabled={blocked}
        optionsState={optionsState}
      />
    </>
  );
}
