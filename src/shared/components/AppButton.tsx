import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { MultilineButton } from '@/shared/components/MultilineButton';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

export type AppButtonVariant =
  'primary' | 'outline' | 'soft' | 'ghost' | 'danger';
export type AppButtonSize = 'small' | 'medium' | 'large' | 'icon';

type AppButtonProps = {
  accessibilityLabel?: string;
  backgroundColor?: string;
  color?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: IconName;
  iconElement?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  label?: string;
  multiline?: boolean;
  onPress: () => void;
  shape?: 'pill' | 'rounded';
  size?: AppButtonSize;
  sizingLabels?: string[];
  style?: StyleProp<ViewStyle>;
  variant?: AppButtonVariant;
};

const buttonModes = {
  primary: 'contained',
  outline: 'outlined',
  soft: 'contained-tonal',
  ghost: 'text',
  danger: 'contained-tonal',
} as const;

export const APP_ICON_BUTTON_SIZE =
  theme.controls.fieldHeight - theme.spacing.md;

export function AppButton({
  accessibilityLabel,
  backgroundColor,
  color,
  disabled,
  fullWidth,
  icon,
  iconElement,
  iconPosition = 'left',
  label,
  multiline = false,
  onPress,
  shape,
  size = 'medium',
  sizingLabels = [],
  style,
  variant = 'primary',
}: AppButtonProps) {
  const isIcon = size === 'icon';
  const buttonColor =
    backgroundColor ??
    (variant === 'danger' ? theme.colors.errorContainer : undefined);
  const textColor =
    color ?? (variant === 'danger' ? theme.colors.onErrorContainer : undefined);
  const buttonStyle = [
    {
      borderRadius:
        (shape ?? (isIcon ? 'rounded' : 'pill')) === 'pill'
          ? theme.radius.pill
          : theme.radius.lg,
    },
    fullWidth ? styles.fullWidth : undefined,
  ];
  const labelStyle = [
    styles.label,
    size === 'large' ? styles.largeLabel : undefined,
  ];
  const renderIcon = ({
    color: iconColor,
    size: iconSize,
  }: {
    color: string;
    size: number;
  }) =>
    iconElement ??
    (icon ? <Ionicons color={iconColor} name={icon} size={iconSize} /> : null);

  if (isIcon) {
    return (
      <IconButton
        accessibilityLabel={accessibilityLabel ?? label}
        containerColor={buttonColor}
        disabled={disabled}
        icon={renderIcon}
        iconColor={textColor}
        mode="contained-tonal"
        onPress={onPress}
        size={theme.typography.sectionTitle}
        style={[styles.icon, buttonStyle, style]}
      />
    );
  }

  if (multiline) {
    return (
      <MultilineButton
        accessibilityLabel={accessibilityLabel ?? label}
        backgroundColor={backgroundColor}
        color={color}
        disabled={disabled}
        icon={icon || iconElement ? renderIcon : undefined}
        iconPosition={iconPosition}
        label={label}
        onPress={onPress}
        style={[buttonStyle, style]}
        variant={variant}
      />
    );
  }

  const button = (
    <Button
      accessibilityLabel={accessibilityLabel ?? label}
      buttonColor={buttonColor}
      compact={size === 'small'}
      contentStyle={[
        styles.content,
        size === 'large' ? styles.largeContent : undefined,
        iconPosition === 'right' ? styles.reversed : undefined,
      ]}
      disabled={disabled}
      icon={icon || iconElement ? renderIcon : undefined}
      labelStyle={labelStyle}
      mode={buttonModes[variant]}
      onPress={onPress}
      style={[buttonStyle, sizingLabels.length ? undefined : style]}
      textColor={textColor}
      uppercase={false}
    >
      {label}
    </Button>
  );

  if (!sizingLabels.length) {
    return button;
  }

  return (
    <View style={[fullWidth ? styles.fullWidth : undefined, style]}>
      {button}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.sizingLabels}
      >
        {sizingLabels.map(sizingLabel => (
          <Text key={sizingLabel} numberOfLines={1} style={labelStyle}>
            {sizingLabel}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    minHeight: theme.controls.fieldHeight,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  largeContent: { minHeight: theme.controls.fieldHeight + theme.spacing.sm },
  reversed: { flexDirection: 'row-reverse' },
  label: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
  },
  largeLabel: { fontSize: theme.typography.bodyLarge },
  fullWidth: { alignSelf: 'stretch', width: '100%' },
  icon: {
    margin: 0,
    height: APP_ICON_BUTTON_SIZE,
    width: APP_ICON_BUTTON_SIZE,
  },
  sizingLabels: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.xxl,
  },
});
