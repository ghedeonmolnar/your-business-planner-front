import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import dayjs from 'dayjs';
import { CalendarDay } from '@/features/bookings/types';
import { companyNow, formatLongDate } from '@/shared/utils/formatDate';
import { theme } from '@/shared/theme/theme';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';

const DAYS_PER_WEEK = 7;
const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];

export function CalendarMonth({
  month,
  days,
  selected,
  onSelect,
}: {
  month: string;
  days: CalendarDay[];
  selected: string;
  onSelect: (date: string) => void;
}) {
  const first = dayjs(`${month}-01`);
  const offset = (first.day() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
  const cellCount =
    Math.ceil((offset + first.daysInMonth()) / DAYS_PER_WEEK) * DAYS_PER_WEEK;
  const byDate = Object.fromEntries(days.map(day => [day.date, day]));
  const today = companyNow().format('YYYY-MM-DD');
  return (
    <View style={[calendarStyles.card, styles.calendar]}>
      <View style={styles.row}>
        {WEEKDAYS.map(label => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>
      {Array.from({ length: cellCount / DAYS_PER_WEEK }, (_, week) => (
        <View key={week} style={styles.row}>
          {WEEKDAYS.map((_, weekday) => {
            const date = first.add(
              week * DAYS_PER_WEEK + weekday - offset,
              'day',
            );
            const iso = date.format('YYYY-MM-DD');
            const summary = byDate[iso];
            const isSelected = iso === selected;
            const isToday = iso === today;
            const occupied =
              summary && summary.confirmed + summary.tentative > 0;
            return (
              <Pressable
                key={iso}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${formatLongDate(iso)}${isToday ? ', azi' : ''}${summary ? `, ${summary.free} săli libere, ${summary.confirmed} confirmate, ${summary.tentative} provizorii` : ''}`}
                onPress={() => onSelect(iso)}
                style={styles.cell}
              >
                <View
                  style={[
                    styles.day,
                    occupied ? styles.occupied : undefined,
                    isToday ? styles.today : undefined,
                    isSelected ? styles.selected : undefined,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      occupied ? styles.occupiedText : undefined,
                      date.month() !== first.month()
                        ? styles.otherMonth
                        : undefined,
                      isSelected ? styles.selectedText : undefined,
                    ]}
                  >
                    {date.date()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: { gap: theme.spacing.xs, paddingHorizontal: theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  weekday: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
    flex: 1,
    paddingVertical: theme.spacing.sm,
    textAlign: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.spacing.xl * 2,
    paddingVertical: theme.spacing.xs,
  },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: theme.colors.menu.surface,
    borderWidth: 2,
    borderRadius: theme.radius.pill,
    minWidth: theme.spacing.xxl + theme.spacing.sm,
    minHeight: theme.spacing.xxl + theme.spacing.sm,
    maxWidth: '100%',
    paddingHorizontal: theme.spacing.xs,
  },
  dayText: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.body,
  },
  occupied: {
    backgroundColor: theme.colors.menu.primarySoft,
    borderColor: theme.colors.menu.primarySoft,
  },
  occupiedText: { color: theme.colors.menu.primary },
  otherMonth: { color: theme.colors.menu.muted },
  today: { borderColor: theme.colors.menu.primary },
  selected: {
    backgroundColor: theme.colors.menu.primary,
    borderColor: theme.colors.menu.primary,
    borderRadius: theme.radius.md,
  },
  selectedText: { color: theme.colors.menu.surface },
});
