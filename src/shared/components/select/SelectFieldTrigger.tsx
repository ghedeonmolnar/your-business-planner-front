import React, { type ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { formInputStyles } from '@/shared/components/FormInput';
import { theme } from '@/shared/theme/theme';

type SelectFieldTriggerProps = {
  accessibilityLabel: string;
  accessibilityValueText: string;
  children?: ReactNode;
  disabled?: boolean;
  expanded: boolean;
  hasError?: boolean;
  onClear?: () => void;
  onPress: () => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
};

export function SelectFieldTrigger({
  accessibilityLabel,
  accessibilityValueText,
  children,
  disabled,
  expanded,
  hasError,
  onClear,
  onPress,
  placeholder,
  style,
}: SelectFieldTriggerProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, expanded }}
      accessibilityValue={{ text: accessibilityValueText }}
      disabled={disabled}
      onPress={onPress}
      style={[
        formInputStyles.field,
        formInputStyles.fieldDimensions,
        styles.field,
        disabled ? formInputStyles.fieldDisabled : undefined,
        hasError ? formInputStyles.fieldError : undefined,
        style,
      ]}
    >
      {children ?? (
        <Text numberOfLines={1} style={selectFieldStyles.placeholder}>
          {placeholder}
        </Text>
      )}
      {onClear ? (
        <Pressable
          accessibilityLabel={`Golește ${accessibilityLabel}`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={event => {
            event.stopPropagation();
            onClear();
          }}
          style={styles.accessory}
        >
          <Ionicons color={theme.colors.subtle} name="close-circle" size={18} />
        </Pressable>
      ) : (
        <View style={styles.accessory}>
          <Ionicons
            color={theme.colors.muted}
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
          />
        </View>
      )}
    </Pressable>
  );
}

const valueText: TextStyle = {
  color: theme.colors.text,
  flex: 1,
  fontFamily: theme.fonts.body,
  fontSize: theme.typography.body,
  paddingRight: theme.spacing.sm,
};

export const selectFieldStyles = StyleSheet.create({
  value: valueText,
  placeholder: {
    ...valueText,
    color: theme.colors.subtle,
  },
});

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accessory: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 32,
  },
});
