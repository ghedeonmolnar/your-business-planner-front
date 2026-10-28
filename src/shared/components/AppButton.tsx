import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { MultilineButton } from '@/shared/components/MultilineButton';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';
import {
  AppButtonSize,
  AppButtonVariant,
  buttonPresentation,
  disabledButtonBackground,
} from '@/shared/components/buttonPresentation';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import { useButtonAction, ButtonAction } from '@/shared/hooks/useButtonAction';

export type {
  AppButtonSize,
  AppButtonVariant,
} from '@/shared/components/buttonPresentation';

export type AppButtonProps = {
  testID?: string;
  accessibilityLabel?: string;
  backgroundColor?: string;
  color?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: IconName;
  iconElement?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
  multiline?: boolean;
  onPress: ButtonAction;
  shape?: 'pill' | 'rounded';
  size?: AppButtonSize;
  sizingLabels?: string[];
  style?: StyleProp<ViewStyle>;
  variant?: AppButtonVariant;
};

export const APP_ICON_BUTTON_SIZE =
  theme.controls.fieldHeight - theme.spacing.xs;

export function AppButton({
  testID,
  accessibilityLabel,
  backgroundColor,
  color,
  disabled,
  fullWidth,
  icon,
  iconElement,
  iconPosition = 'left',
  label,
  loading = false,
  loadingLabel,
  multiline = false,
  onPress,
  shape = 'rounded',
  size = 'medium',
  sizingLabels = [],
  style,
  variant = 'primary',
}: AppButtonProps) {
  const isIcon = size === 'icon';
  const presentation = buttonPresentation[variant];
  const formBusy = useFormBusy();
  const action = useButtonAction(
    onPress,
    Boolean(disabled || loading || formBusy),
  );
  const busy = loading || action.pending;
  const blocked = Boolean(disabled || busy || formBusy);
  const buttonColor = blocked
    ? disabledButtonBackground(variant)
    : (backgroundColor ?? presentation.backgroundColor);
  const textColor = blocked
    ? theme.colors.onSurfaceDisabled
    : (color ?? presentation.color);
  const displayLabel = busy && loadingLabel ? loadingLabel : label;
  const handlePress = action.press;
  const buttonStyle = [
    {
      borderRadius: shape === 'pill' ? theme.radius.pill : theme.radius.lg,
      borderColor: blocked
        ? theme.colors.surfaceDisabled
        : theme.colors.menu.border,
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
        testID={testID}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: blocked, busy }}
        containerColor={buttonColor}
        disabled={blocked}
        loading={busy}
        icon={renderIcon}
        iconColor={textColor}
        mode={presentation.iconMode}
        onPress={handlePress}
        size={theme.typography.sectionTitle}
        style={[styles.icon, buttonStyle, style]}
      />
    );
  }

  if (multiline) {
    return (
      <MultilineButton
        testID={testID}
        accessibilityLabel={accessibilityLabel ?? label}
        backgroundColor={buttonColor}
        color={textColor}
        disabled={blocked}
        loading={busy}
        icon={icon || iconElement ? renderIcon : undefined}
        iconPosition={iconPosition}
        label={displayLabel}
        onPress={handlePress}
        size={size}
        style={[buttonStyle, style]}
        variant={variant}
      />
    );
  }

  const button = (
    <Button
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: blocked, busy }}
      buttonColor={buttonColor}
      compact={size === 'small'}
      contentStyle={[
        styles.content,
        size === 'large' ? styles.largeContent : undefined,
        iconPosition === 'right' && !busy ? styles.reversed : undefined,
      ]}
      disabled={blocked}
      loading={busy}
      icon={icon || iconElement ? renderIcon : undefined}
      labelStyle={labelStyle}
      mode={presentation.mode}
      onPress={handlePress}
      style={[buttonStyle, sizingLabels.length ? undefined : style]}
      textColor={textColor}
      uppercase={false}
    >
      {displayLabel}
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
