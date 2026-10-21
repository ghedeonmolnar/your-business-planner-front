import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { CalendarDay } from '@/features/bookings/types';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { theme } from '@/shared/theme/theme';
import { formatLongDate } from '@/shared/utils/formatDate';

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
  const byDate = Object.fromEntries(days.map(day => [day.date, day]));
  return (
    <Calendar
      key={month}
      current={month + '-01'}
      hideArrows
      disableMonthChange
      hideExtraDays
      firstDay={1}
      theme={{
        calendarBackground: theme.colors.surface,
        monthTextColor: theme.colors.text,
        textSectionTitleColor: theme.colors.muted,
        textMonthFontSize: theme.typography.sectionTitle,
      }}
      style={calendarStyles.calendar}
      dayComponent={({ date, state }) => {
        if (!date) {
          return <View />;
        }
        const summary = byDate[date.dateString];
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: date.dateString === selected }}
            accessibilityLabel={
              formatLongDate(date.dateString) +
              (summary
                ? ', ' +
                  summary.free +
                  ' săli libere, ' +
                  summary.confirmed +
                  ' confirmate, ' +
                  summary.tentative +
                  ' provizorii'
                : '')
            }
            onPress={() => onSelect(date.dateString)}
            style={[
              calendarStyles.day,
              date.dateString === selected && calendarStyles.selectedDay,
            ]}
          >
            <Text
              style={[
                styles.text,
                state === 'disabled'
                  ? { color: theme.colors.subtle }
                  : undefined,
              ]}
            >
              {date.day}
            </Text>
            {summary ? <Text style={styles.muted}>{summary.free}</Text> : null}
          </Pressable>
        );
      }}
    />
  );
}

const calendarStyles = StyleSheet.create({
  calendar: { borderRadius: theme.radius.lg, padding: theme.spacing.sm },
  day: {
    padding: theme.spacing.xs,
    minHeight: theme.controls.fieldHeight,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
  },
  selectedDay: { backgroundColor: theme.colors.blueSoft },
});
