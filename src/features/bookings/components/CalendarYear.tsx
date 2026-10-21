import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CalendarDay } from '@/features/bookings/types';
import {
  getMonthStatistics,
  occupancyLabel,
} from '@/features/bookings/utils/calendarStatistics';
import { OccupancyBar } from '@/shared/components/OccupancyBar';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { theme } from '@/shared/theme/theme';
import { formatMonthLabel, formatMonthName } from '@/shared/utils/formatDate';

const MONTHS_PER_YEAR = 12;

export function CalendarYear({
  year,
  selectedMonth,
  days,
  onSelect,
}: {
  year: string;
  selectedMonth: string;
  days: CalendarDay[];
  onSelect: (month: string) => void;
}) {
  const singleColumn = useSingleColumnLayout();
  return (
    <View style={styles.grid}>
      {Array.from({ length: MONTHS_PER_YEAR }, (_, index) => {
        const month = `${year}-${String(index + 1).padStart(2, '0')}`;
        const statistics = getMonthStatistics(month, days);
        const selected = month === selectedMonth;
        const count = statistics.complete
          ? `${statistics.bookings} ${statistics.bookings === 1 ? 'rezervare' : 'rezervări'}`
          : '—';
        return (
          <View
            key={month}
            style={[styles.cell, singleColumn ? styles.fullWidth : undefined]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Selectează ${formatMonthLabel(month)}, ${count}, ${occupancyLabel(statistics)}`}
              accessibilityState={{ selected }}
              onPress={() => onSelect(month)}
              style={[styles.card, selected ? styles.selected : undefined]}
            >
              <Text style={styles.name}>{formatMonthName(month)}</Text>
              <OccupancyBar value={statistics.occupancy} />
              <View>
                <Text style={styles.count}>{count}</Text>
                <Text style={styles.caption}>{occupancyLabel(statistics)}</Text>
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  cell: { width: '33.333333%', padding: theme.spacing.xs },
  fullWidth: { width: '100%' },
  card: {
    backgroundColor: theme.colors.menu.surface,
    borderColor: theme.colors.menu.surface,
    borderWidth: 2,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    flex: 1,
  },
  selected: {
    backgroundColor: theme.colors.menu.selected,
    borderColor: theme.colors.menu.primary,
  },
  name: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.bodySmall,
  },
  count: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
  },
  caption: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
  },
});
