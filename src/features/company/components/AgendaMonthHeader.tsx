import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';

type AgendaMonthHeaderProps = {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
};

export function AgendaMonthHeader({
  title,
  count,
  expanded,
  onToggle,
}: AgendaMonthHeaderProps) {
  const countLabel = `${count} ${count === 1 ? 'eveniment' : 'evenimente'}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${countLabel}`}
      accessibilityState={{ expanded }}
      onPress={onToggle}
      style={styles.header}
    >
      <Ionicons
        accessible={false}
        name="calendar-outline"
        color={theme.colors.menu.primary}
        size={theme.typography.title}
      />
      <View style={styles.labels}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{countLabel}</Text>
      </View>
      <Ionicons
        accessible={false}
        name={expanded ? 'chevron-down' : 'chevron-forward'}
        color={theme.colors.menu.primary}
        size={theme.typography.sectionTitle}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: theme.controls.fieldHeight,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  labels: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  title: {
    color: theme.colors.menu.text,
    flexGrow: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.subtitle,
  },
  count: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
});
