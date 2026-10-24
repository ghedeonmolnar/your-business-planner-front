import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

type InfoRowProps = {
  icon?: IconName;
  label?: string;
  value: string | number;
  emphasized?: boolean;
  accessibilityLabel?: string;
  highlighted?: boolean;
};

export function InfoRow({
  icon,
  label,
  value,
  emphasized = false,
  accessibilityLabel,
  highlighted = false,
}: InfoRowProps) {
  return (
    <View
      accessible
      accessibilityLabel={
        accessibilityLabel ?? (label ? `${label}: ${value}` : String(value))
      }
      style={styles.row}
    >
      {icon ? (
        <Ionicons
          accessible={false}
          name={icon}
          size={theme.typography.bodyLarge}
          color={theme.colors.menu.muted}
        />
      ) : null}
      <Text
        style={[
          styles.text,
          highlighted ? styles.highlighted : undefined,
          emphasized ? styles.emphasized : undefined,
        ]}
      >
        {label ? `${label}: ` : ''}
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    maxWidth: '100%',
  },
  text: {
    color: theme.colors.menu.muted,
    flexShrink: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  emphasized: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.bodySemibold,
  },
  highlighted: { color: theme.colors.menu.text },
});
