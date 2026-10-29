import React, { type ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle, View } from 'react-native';
import { HelperText, Text } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';
import { formFieldLabel } from '@/shared/utils/formFieldLabel';

type FormInputProps = {
  children: ReactNode;
  error?: string;
  label: string;
  required?: boolean;
  hideLabel?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function FormInput({
  children,
  error,
  label,
  required = false,
  hideLabel = false,
  style,
}: FormInputProps) {
  return (
    <View style={[styles.group, style]}>
      {hideLabel ? null : (
        <Text style={[styles.label, error ? styles.labelError : undefined]}>
          {formFieldLabel(label, required)}
        </Text>
      )}
      {children}
      {error ? (
        <HelperText
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          padding="none"
          type="error"
        >
          {error}
        </HelperText>
      ) : null}
    </View>
  );
}

export const formInputStyles = StyleSheet.create({
  field: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.menu.border,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
  },
  fieldDimensions: {
    borderRadius: theme.radius.md,
    minHeight: theme.controls.fieldHeight,
    paddingVertical: 0,
  },
  fieldDisabled: {
    opacity: 0.56,
  },
  fieldError: {
    borderColor: theme.colors.danger,
  },
});

const styles = StyleSheet.create({
  group: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.meta,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.xs,
  },
  labelError: {
    color: theme.colors.danger,
  },
});
