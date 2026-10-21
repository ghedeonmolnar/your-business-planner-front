import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';

type EditIconButtonProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function EditIconButton({
  accessibilityLabel,
  disabled,
  onPress,
  style,
}: EditIconButtonProps) {
  return (
    <AppButton
      accessibilityLabel={accessibilityLabel}
      backgroundColor={theme.colors.surfaceMuted}
      disabled={disabled}
      iconElement={<Text style={styles.icon}>✎</Text>}
      onPress={onPress}
      size="icon"
      style={style}
      variant="soft"
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    color: theme.colors.primary,
    fontSize: theme.typography.sectionTitle,
    lineHeight: 22,
  },
});
