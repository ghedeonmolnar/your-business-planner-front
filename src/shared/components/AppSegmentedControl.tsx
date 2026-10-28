import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
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
      <View style={[styles.row, { gap: segmentGap }]}>
        {segments.map(({ label, icon, disabled: segmentDisabled }, index) => {
          const selected = index === selectedIndex;
          const segmentBlocked = blocked || Boolean(segmentDisabled);
          const color = segmentBlocked
            ? theme.colors.onSurfaceDisabled
            : selected
              ? activeColor
              : inactiveColor;
          return (
            <TouchableRipple
              key={label}
              testID={testID ? `${testID}:${index}` : undefined}
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: segmentBlocked }}
              disabled={segmentBlocked}
              onPress={() => {
                if (!segmentBlocked) onChangeIndex(index);
              }}
              style={[
                styles.segment,
                segmentStyle,
                {
                  backgroundColor: segmentBlocked
                    ? theme.colors.surfaceDisabled
                    : selected
                      ? activeBackgroundColor
                      : inactiveBackgroundColor,
                },
              ]}
            >
              <View style={styles.content}>
                {icon ? (
                  <Ionicons
                    accessible={false}
                    name={icon}
                    color={color}
                    size={theme.typography.sectionTitle}
                  />
                ) : null}
                <Text style={[styles.label, { color }]}>{label}</Text>
              </View>
            </TouchableRipple>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  segment: {
    flex: 1,
    minWidth: 0,
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    minHeight: theme.controls.fieldHeight,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
    textAlign: 'center',
  },
});
