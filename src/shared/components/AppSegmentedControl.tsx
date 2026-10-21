import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

type AppSegmentedControlProps = {
  containerStyle?: StyleProp<ViewStyle>;
  onChangeIndex: (index: number) => void;
  segments: { label: string }[];
  selectedIndex: number;
  testID?: string;
};

export function AppSegmentedControl({
  containerStyle,
  onChangeIndex,
  segments,
  selectedIndex,
  testID,
}: AppSegmentedControlProps) {
  return (
    <View style={containerStyle} testID={testID}>
      <SegmentedButtons
        buttons={segments.map((segment, index) => ({
          value: String(index),
          label: segment.label,
          labelStyle: styles.label,
        }))}
        onValueChange={value => onChangeIndex(Number(value))}
        value={String(selectedIndex)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
  },
});
