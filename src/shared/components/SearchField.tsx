import React from 'react';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  style,
  inputStyle,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Searchbar
      accessibilityLabel={label}
      autoCapitalize="none"
      clearAccessibilityLabel="Golește căutarea"
      clearIcon="close"
      icon="magnify"
      inputStyle={[styles.input, inputStyle]}
      maxLength={255}
      onChangeText={onChange}
      placeholder={placeholder}
      searchAccessibilityLabel={label}
      style={[styles.field, style]}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: theme.spacing.md },
  input: { fontFamily: theme.fonts.body, fontSize: theme.typography.body },
});
