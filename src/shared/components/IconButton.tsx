import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { AppButton } from '@/shared/components/AppButton';
import { AppButtonVariant } from '@/shared/components/buttonPresentation';
import { IconName } from '@/shared/types/icon';

type IconButtonProps = {
  icon: IconName;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
  accessibilityLabel: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: AppButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  onPress,
  color,
  backgroundColor,
  accessibilityLabel,
  disabled,
  loading,
  variant = 'soft',
  style,
}: IconButtonProps) {
  return (
    <AppButton
      accessibilityLabel={accessibilityLabel}
      backgroundColor={backgroundColor}
      color={color}
      disabled={disabled}
      loading={loading}
      icon={icon}
      onPress={onPress}
      size="icon"
      style={style}
      variant={variant}
    />
  );
}
