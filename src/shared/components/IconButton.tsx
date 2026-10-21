import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

type IconButtonProps = {
  icon: IconName;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
  accessibilityLabel: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  onPress,
  color = theme.colors.primary,
  backgroundColor = theme.colors.surfaceMuted,
  accessibilityLabel,
  disabled,
  style,
}: IconButtonProps) {
  return (
    <AppButton
      accessibilityLabel={accessibilityLabel}
      backgroundColor={backgroundColor}
      color={color}
      disabled={disabled}
      icon={icon}
      onPress={onPress}
      size="icon"
      style={style}
      variant="soft"
    />
  );
}
