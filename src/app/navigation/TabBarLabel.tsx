import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

type TabBarLabelProps = {
  label: string;
  color: string;
  onHeightChange: (height: number) => void;
};

export function TabBarLabel({
  label,
  color,
  onHeightChange,
}: TabBarLabelProps) {
  return (
    <Text
      onLayout={event =>
        onHeightChange(Math.ceil(event.nativeEvent.layout.height))
      }
      style={[styles.label, { color }]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    alignSelf: 'stretch',
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.caption,
    lineHeight: theme.spacing.lg,
    textAlign: 'center',
  },
});
