import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ActivityIndicator, Text, TouchableRipple } from 'react-native-paper';
import {
  AppButtonSize,
  AppButtonVariant,
  buttonPresentation,
  disabledButtonBackground,
} from '@/shared/components/buttonPresentation';
import { theme } from '@/shared/theme/theme';

type MultilineButtonProps = {
  testID?: string;
  accessibilityLabel?: string;
  backgroundColor?: string;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: (props: { color: string; size: number }) => React.ReactNode;
  iconPosition: 'left' | 'right';
  label?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant: AppButtonVariant;
  size?: AppButtonSize;
};

export function MultilineButton({
  testID,
  accessibilityLabel,
  backgroundColor,
  color,
  disabled,
  loading = false,
  icon,
  iconPosition,
  label,
  onPress,
  style,
  variant,
  size = 'medium',
}: MultilineButtonProps) {
  const blocked = Boolean(disabled || loading);
  const textColor = blocked
    ? theme.colors.onSurfaceDisabled
    : (color ?? buttonPresentation[variant].color);
  return (
    <TouchableRipple
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={() => {
        if (!blocked) onPress();
      }}
      style={[
        styles.button,
        {
          backgroundColor: blocked
            ? disabledButtonBackground(variant)
            : (backgroundColor ?? buttonPresentation[variant].backgroundColor),
          borderColor: blocked
            ? theme.colors.surfaceDisabled
            : theme.colors.menu.border,
        },
        variant === 'outline' ? styles.outline : undefined,
        size === 'large' ? styles.large : undefined,
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          iconPosition === 'right' && !loading ? styles.reversed : undefined,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          icon?.({ color: textColor, size: theme.typography.sectionTitle })
        )}
        <Text
          style={[
            styles.label,
            size === 'large' ? styles.largeLabel : undefined,
            { color: textColor },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    minHeight: theme.controls.fieldHeight,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  outline: { borderWidth: 1 },
  large: { minHeight: theme.controls.fieldHeight + theme.spacing.sm },
  largeLabel: { fontSize: theme.typography.bodyLarge },
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
