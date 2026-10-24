import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CalendarPeriod } from '@/features/bookings/hooks/useCalendarNavigation';
import { theme } from '@/shared/theme/theme';

type LegendItem = {
  label: string;
  color: string;
  outline?: boolean;
};

export function CalendarLegend({ period }: { period: CalendarPeriod }) {
  const items: LegendItem[] =
    period === 'month'
      ? [
          { label: 'Azi', color: theme.colors.menu.surface, outline: true },
          { label: 'Selectat', color: theme.colors.menu.primary },
          {
            label: 'Parțial rezervat',
            color: theme.colors.menu.primarySoft,
          },
          {
            label: 'Complet rezervat',
            color: theme.colors.menu.success,
          },
        ]
      : [
          { label: 'Liber', color: theme.colors.menu.border },
          { label: 'Moderat', color: theme.colors.menu.primarySoft },
          { label: 'Aglomerat', color: theme.colors.menu.primary },
          {
            label: 'Selectat',
            color: theme.colors.menu.surface,
            outline: true,
          },
        ];
  return (
    <View style={styles.legend}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map(item => (
          <View key={item.label} style={styles.item}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: item.color },
                item.outline ? styles.outline : undefined,
              ]}
            />
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    backgroundColor: theme.colors.menu.background,
    borderColor: theme.colors.menu.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: theme.spacing.xs,
  },
  swatch: {
    width: theme.spacing.md,
    height: theme.spacing.md,
    borderRadius: theme.radius.pill,
    flexShrink: 0,
  },
  outline: { borderColor: theme.colors.menu.primary, borderWidth: 2 },
  label: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.caption,
  },
});
