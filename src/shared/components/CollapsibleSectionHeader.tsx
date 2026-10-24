import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { IconName } from '@/shared/types/icon';
import { theme } from '@/shared/theme/theme';

type CollapsibleSectionHeaderProps = {
  title: string;
  countLabel?: string;
  icon?: IconName;
  expanded: boolean;
  onToggle: () => void;
  accessibilityLabel?: string;
};

export function CollapsibleSectionHeader({
  title,
  countLabel,
  icon,
  expanded,
  onToggle,
  accessibilityLabel,
}: CollapsibleSectionHeaderProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? [title, countLabel].filter(Boolean).join(', ')
      }
      accessibilityState={{ expanded }}
      onPress={onToggle}
      style={styles.header}
    >
      {icon ? (
        <Ionicons
          accessible={false}
          name={icon}
          color={theme.colors.menu.primary}
          size={theme.typography.title}
        />
      ) : null}
      <View style={styles.labels}>
        <Text style={styles.title}>{title}</Text>
        {countLabel ? <Text style={styles.count}>{countLabel}</Text> : null}
      </View>
      <Ionicons
        accessible={false}
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={theme.typography.sectionTitle}
        color={theme.colors.menu.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.menu.primarySoft,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: theme.controls.fieldHeight,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  labels: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.subtitle,
    flexGrow: 1,
    flexShrink: 1,
  },
  count: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.bodySmall,
  },
});
