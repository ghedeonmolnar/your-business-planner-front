import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { IconBadge, IconBadgeTone } from '@/shared/components/IconBadge';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';
import { useButtonAction, ButtonAction } from '@/shared/hooks/useButtonAction';

export type ActionTileProps = {
  label: string;
  description?: string;
  icon: IconName;
  tone?: IconBadgeTone;
  variant?: 'card' | 'row' | 'soft' | 'danger';
  onPress: ButtonAction;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
};

export type ActionItem = ActionTileProps & { id: string };

export function ActionTile({
  label,
  description,
  icon,
  tone,
  variant = 'card',
  onPress,
  disabled,
  style,
  labelStyle,
  descriptionStyle,
}: ActionTileProps) {
  const action = useButtonAction(onPress, disabled);
  const blocked = Boolean(disabled || action.pending);
  const color =
    variant === 'danger'
      ? theme.colors.onErrorContainer
      : variant === 'soft'
        ? theme.colors.menu.primary
        : theme.colors.menu.text;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: action.pending }}
      android_ripple={{ color: theme.colors.menu.primarySoft }}
      disabled={blocked}
      onPress={action.press}
      style={({ pressed }) => [
        styles.base,
        variant === 'card' ? styles.card : styles.row,
        variant === 'soft' ? styles.soft : undefined,
        variant === 'danger' ? styles.danger : undefined,
        pressed || blocked ? styles.faded : undefined,
        style,
      ]}
    >
      {action.pending ? (
        <ActivityIndicator color={color} size="small" />
      ) : variant === 'card' ? (
        <IconBadge icon={icon} tone={tone} />
      ) : (
        <Ionicons
          accessible={false}
          name={icon}
          color={variant === 'danger' ? theme.colors.menu.danger : color}
          size={theme.typography.title}
        />
      )}
      <View style={styles.content}>
        <Text style={[styles.label, { color }, labelStyle]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, descriptionStyle]}>
            {description}
          </Text>
        ) : null}
      </View>
      <Ionicons
        accessible={false}
        color={
          variant === 'soft'
            ? theme.colors.menu.primary
            : theme.colors.menu.muted
        }
        name="chevron-forward"
        size={theme.typography.label}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    overflow: 'hidden',
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.menu.surface,
    minHeight: theme.controls.fieldHeight + theme.spacing.xl,
    padding: theme.spacing.sm,
  },
  row: { minHeight: theme.controls.fieldHeight },
  soft: { backgroundColor: theme.colors.menu.primarySoft },
  danger: { backgroundColor: theme.colors.menu.dangerSoft },
  faded: { opacity: 0.65 },
  content: { flex: 1, gap: theme.spacing.xs, minWidth: 0 },
  label: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.label,
    letterSpacing: 0,
  },
  description: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
    letterSpacing: 0,
  },
});
