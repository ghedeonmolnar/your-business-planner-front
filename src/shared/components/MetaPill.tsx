import React from 'react';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Chip } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

type MetaPillProps = {
  icon?: IconName;
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  textStyle?: StyleProp<TextStyle>;
};

export function MetaPill({
  icon,
  label,
  color = theme.colors.primary,
  style,
  testID,
  textStyle,
}: MetaPillProps) {
  return (
    <Chip
      accessibilityLabel={label}
      accessibilityRole="text"
      icon={
        icon
          ? ({ size }) => <Ionicons name={icon} size={size} color={color} />
          : undefined
      }
      mode="outlined"
      style={[styles.pill, style]}
      textStyle={[styles.text, textStyle]}
      testID={testID}
    >
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    maxWidth: '100%',
  },
  text: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.meta,
    flexShrink: 1,
  },
});
