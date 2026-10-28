import React from 'react';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import { formInputStyles } from '@/shared/components/FormInput';
import { theme } from '@/shared/theme/theme';

export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  style,
  inputStyle,
  disabled = false,
  loading = false,
  autoFocus = false,
  testID,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  testID?: string;
}) {
  const busy = useFormBusy();
  const blocked = disabled || busy;
  return (
    <Searchbar
      testID={testID}
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      autoCapitalize="none"
      autoFocus={autoFocus}
      clearAccessibilityLabel="Golește căutarea"
      clearIcon={({ color, size }) => (
        <Ionicons name="close" color={color} size={size} />
      )}
      editable={!blocked}
      icon={({ color, size }) => (
        <Ionicons name="search-outline" color={color} size={size} />
      )}
      inputStyle={[styles.input, inputStyle]}
      loading={loading}
      maxLength={255}
      onChangeText={nextValue => {
        if (!blocked) onChange(nextValue);
      }}
      placeholder={placeholder}
      right={blocked ? () => null : undefined}
      searchAccessibilityLabel={label}
      style={[
        styles.field,
        blocked ? formInputStyles.fieldDisabled : undefined,
        style,
      ]}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: theme.colors.menu.surface,
    borderRadius: theme.radius.md,
  },
  input: { fontFamily: theme.fonts.body, fontSize: theme.typography.body },
});
