import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';
import { useFormBusy } from '@/shared/components/FormInteractionContext';

type AppSegmentedControlProps = {
  containerStyle?: StyleProp<ViewStyle>;
  onChangeIndex: (index: number) => void;
  segments: { label: string; icon?: IconName; disabled?: boolean }[];
  selectedIndex: number;
  testID?: string;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
  segmentStyle?: StyleProp<ViewStyle>;
  segmentGap?: number;
  disabled?: boolean;
};

export function AppSegmentedControl({
  containerStyle,
  onChangeIndex,
  segments,
  selectedIndex,
  testID,
  activeBackgroundColor = theme.colors.menu.primary,
  inactiveBackgroundColor = theme.colors.menu.surface,
  activeColor = theme.colors.menu.surface,
  inactiveColor = theme.colors.menu.primary,
  segmentStyle,
  segmentGap = theme.spacing.xs,
  disabled = false,
}: AppSegmentedControlProps) {
  const formBusy = useFormBusy();
  const blocked = disabled || formBusy;
  return (
    <View style={containerStyle} testID={testID}>
      <SegmentedButtons
        style={{ gap: segmentGap }}
        buttons={segments.map(
          ({ label, icon, disabled: segmentDisabled }, index) => ({
            value: String(index),
            testID: testID ? `${testID}:${index}` : undefined,
            label,
            accessibilityLabel: label,
            disabled: blocked || segmentDisabled,
            labelStyle: styles.label,
            checkedColor: activeColor,
            uncheckedColor: inactiveColor,
            icon: icon
              ? ({ color, size }) => (
                  <Ionicons name={icon} color={color} size={size} />
                )
              : undefined,
            style: [
              styles.segment,
              segmentStyle,
              {
                backgroundColor:
                  index === selectedIndex
                    ? activeBackgroundColor
                    : inactiveBackgroundColor,
              },
            ],
          }),
        )}
        onValueChange={value => {
          const index = Number(value);
          if (!blocked && segments[index] && !segments[index].disabled)
            onChangeIndex(index);
        }}
        value={String(selectedIndex)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.md,
    minHeight: theme.controls.fieldHeight,
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
  },
});
