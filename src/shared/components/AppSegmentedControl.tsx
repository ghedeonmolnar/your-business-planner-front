import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

type AppSegmentedControlProps = {
  containerStyle?: StyleProp<ViewStyle>;
  onChangeIndex: (index: number) => void;
  segments: { label: string; icon?: IconName }[];
  selectedIndex: number;
  testID?: string;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
  segmentStyle?: StyleProp<ViewStyle>;
};

export function AppSegmentedControl({
  containerStyle,
  onChangeIndex,
  segments,
  selectedIndex,
  testID,
  activeBackgroundColor,
  inactiveBackgroundColor,
  activeColor,
  inactiveColor,
  segmentStyle,
}: AppSegmentedControlProps) {
  return (
    <View style={containerStyle} testID={testID}>
      <SegmentedButtons
        buttons={segments.map(({ label, icon }, index) => ({
          value: String(index),
          label,
          accessibilityLabel: label,
          labelStyle: styles.label,
          checkedColor: activeColor,
          uncheckedColor: inactiveColor,
          icon: icon
            ? ({ color, size }) => (
                <Ionicons name={icon} color={color} size={size} />
              )
            : undefined,
          style: [
            segmentStyle,
            {
              backgroundColor:
                index === selectedIndex
                  ? activeBackgroundColor
                  : inactiveBackgroundColor,
            },
          ],
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
