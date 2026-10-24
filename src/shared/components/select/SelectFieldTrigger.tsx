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
import { IconName } from '@/shared/types/icon';

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
  icon?: IconName;
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
  icon,
}: SelectFieldTriggerProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, expanded }}
      accessibilityValue={{ text: accessibilityValueText }}
      disabled={disabled}
      onPress={() => {
        if (!disabled) onPress();
      }}
      style={[
        formInputStyles.field,
        formInputStyles.fieldDimensions,
        styles.field,
        disabled ? formInputStyles.fieldDisabled : undefined,
        hasError ? formInputStyles.fieldError : undefined,
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          accessible={false}
          name={icon}
          size={theme.typography.title}
          color={theme.colors.menu.muted}
          style={styles.leadingIcon}
        />
      ) : null}
      {children ?? (
        <Text numberOfLines={1} style={selectFieldStyles.placeholder}>
          {placeholder}
        </Text>
      )}
      {onClear ? (
        <Pressable
          accessibilityLabel={`Golește ${accessibilityLabel}`}
          accessibilityRole="button"
          disabled={disabled}
          hitSlop={theme.spacing.sm}
          onPress={event => {
            event.stopPropagation();
            if (!disabled) onClear();
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
  leadingIcon: { marginRight: theme.spacing.sm },
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
