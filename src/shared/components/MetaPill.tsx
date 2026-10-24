import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

export type MetaPillTone =
  'neutral' | 'primary' | 'success' | 'warning' | 'danger';

type MetaPillProps = {
  icon?: IconName;
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  textStyle?: StyleProp<TextStyle>;
  tone?: MetaPillTone;
  onRemove?: () => void;
  removeLabel?: string;
};

const toneColors = {
  neutral: {
    backgroundColor: theme.colors.menu.background,
    color: theme.colors.menu.muted,
  },
  primary: {
    backgroundColor: theme.colors.menu.primarySoft,
    color: theme.colors.menu.primary,
  },
  success: {
    backgroundColor: theme.colors.menu.successSoft,
    color: theme.colors.menu.text,
  },
  warning: {
    backgroundColor: theme.colors.menu.invitationsSoft,
    color: theme.colors.menu.text,
  },
  danger: {
    backgroundColor: theme.colors.errorContainer,
    color: theme.colors.onErrorContainer,
  },
};

export function MetaPill({
  icon,
  label,
  color,
  style,
  testID,
  textStyle,
  tone = 'neutral',
  onRemove,
  removeLabel = 'Elimină selecția',
}: MetaPillProps) {
  const colors = toneColors[tone];
  const foreground = color ?? colors.color;
  return (
    <View
      accessible={!onRemove}
      accessibilityLabel={label}
      accessibilityRole="text"
      style={[styles.pill, { backgroundColor: colors.backgroundColor }, style]}
      testID={testID}
    >
      {icon ? (
        <Ionicons
          accessible={false}
          name={icon}
          size={theme.typography.bodyLarge}
          color={foreground}
        />
      ) : null}
      <Text style={[styles.text, { color: foreground }, textStyle]}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={removeLabel}
          onPress={onRemove}
          style={styles.remove}
        >
          <Ionicons
            accessible={false}
            name="close"
            size={theme.typography.bodyLarge}
            color={foreground}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    maxWidth: '100%',
  },
  text: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
    flexShrink: 1,
  },
  remove: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: theme.controls.fieldHeight - theme.spacing.sm,
    minHeight: theme.controls.fieldHeight - theme.spacing.sm,
  },
});
