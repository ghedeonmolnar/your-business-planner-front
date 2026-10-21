import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

export function SearchField({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <Searchbar
      accessibilityLabel={label}
      autoCapitalize="none"
      clearAccessibilityLabel="Golește căutarea"
      inputStyle={styles.input}
      maxLength={255}
      onChangeText={onChange}
      placeholder={placeholder}
      searchAccessibilityLabel={label}
      style={styles.field}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: theme.spacing.md },
  input: { fontFamily: theme.fonts.body, fontSize: theme.typography.body },
});
