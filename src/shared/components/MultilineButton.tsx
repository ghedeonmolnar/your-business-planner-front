import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import type { AppButtonVariant } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';

type MultilineButtonProps = {
  accessibilityLabel?: string;
  backgroundColor?: string;
  color?: string;
  disabled?: boolean;
  icon?: (props: { color: string; size: number }) => React.ReactNode;
  iconPosition: 'left' | 'right';
  label?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant: AppButtonVariant;
};

const variantColors = {
  primary: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.onPrimary,
  },
  outline: {
    backgroundColor: theme.colors.background,
    color: theme.colors.primary,
  },
  soft: {
    backgroundColor: theme.colors.secondaryContainer,
    color: theme.colors.onSecondaryContainer,
  },
  ghost: {
    backgroundColor: theme.colors.elevation.level0,
    color: theme.colors.primary,
  },
  danger: {
    backgroundColor: theme.colors.errorContainer,
    color: theme.colors.onErrorContainer,
  },
};

export function MultilineButton({
  accessibilityLabel,
  backgroundColor,
  color,
  disabled,
  icon,
  iconPosition,
  label,
  onPress,
  style,
  variant,
}: MultilineButtonProps) {
  const textColor = disabled
    ? theme.colors.onSurfaceDisabled
    : (color ?? variantColors[variant].color);
  return (
    <TouchableRipple
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: disabled
            ? theme.colors.surfaceDisabled
            : (backgroundColor ?? variantColors[variant].backgroundColor),
        },
        variant === 'outline' ? styles.outline : undefined,
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          iconPosition === 'right' ? styles.reversed : undefined,
        ]}
      >
        {icon?.({ color: textColor, size: theme.typography.sectionTitle })}
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
    minHeight: theme.controls.fieldHeight,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  outline: { borderColor: theme.colors.outline, borderWidth: 1 },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  reversed: { flexDirection: 'row-reverse' },
  label: {
    flexShrink: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
    textAlign: 'center',
  },
});
