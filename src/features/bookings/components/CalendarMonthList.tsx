import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import dayjs from 'dayjs';
import { CalendarDay } from '@/features/bookings/types';
import { formatLongDate } from '@/shared/utils/formatDate';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';
import { theme } from '@/shared/theme/theme';

export function CalendarMonthList({
  month,
  days,
  selected,
  hasHalls,
  onSelect,
}: {
  month: string;
  days: CalendarDay[];
  selected: string;
  hasHalls: boolean;
  onSelect: (date: string) => void;
}) {
  const first = dayjs(`${month}-01`);
  const byDate = Object.fromEntries(days.map(day => [day.date, day]));
  return (
    <View style={calendarStyles.card}>
      <Text accessibilityRole="header" style={calendarStyles.title}>
        Disponibilitate pe zile
      </Text>
      {Array.from({ length: first.daysInMonth() }, (_, index) => {
        const date = first.add(index, 'day').format('YYYY-MM-DD');
        const summary = byDate[date];
        const occupied = summary
          ? (summary.occupied_halls ?? summary.confirmed + summary.tentative)
          : 0;
        const status = !summary
          ? 'Date indisponibile'
          : !hasHalls
            ? 'Nicio sală activă'
            : occupied === 0
              ? `Liber · ${summary.free} săli libere`
              : summary.free === 0
                ? 'Complet rezervat · 0 săli libere'
                : `Parțial rezervat · ${summary.free} săli libere`;
        return (
          <Pressable
            key={date}
            testID={`calendar-day:${date}`}
            accessibilityRole="button"
            accessibilityLabel={`${formatLongDate(date)}, ${status}`}
            accessibilityState={{ selected: date === selected }}
            onPress={() => onSelect(date)}
            style={[
              styles.row,
              date === selected ? styles.selected : undefined,
            ]}
          >
            <Text style={calendarStyles.text}>{formatLongDate(date)}</Text>
            <Text style={calendarStyles.muted}>{status}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: theme.controls.fieldHeight,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.menu.border,
  },
  selected: {
    backgroundColor: theme.colors.menu.primarySoft,
    borderColor: theme.colors.menu.primary,
  },
});
