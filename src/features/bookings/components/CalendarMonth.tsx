import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import dayjs from 'dayjs';
import { CalendarDay } from '@/features/bookings/types';
import { companyNow, formatLongDate } from '@/shared/utils/formatDate';
import { theme } from '@/shared/theme/theme';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { CalendarMonthList } from '@/features/bookings/components/CalendarMonthList';

const DAYS_PER_WEEK = 7;
const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];

export function CalendarMonth({
  month,
  days,
  selected,
  onSelect,
  hasHalls = true,
}: {
  month: string;
  days: CalendarDay[];
  selected: string;
  onSelect: (date: string) => void;
  hasHalls?: boolean;
}) {
  const list = useSingleColumnLayout();
  if (list)
    return (
      <CalendarMonthList
        month={month}
        days={days}
        selected={selected}
        hasHalls={hasHalls}
        onSelect={onSelect}
      />
    );
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
      {Array.from({ length: cellCount / DAYS_PER_WEEK }, (_week, week) => (
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
              summary !== undefined &&
              (summary.occupied_halls ??
                summary.confirmed + summary.tentative) > 0;
            const fullyBooked = hasHalls && occupied && summary?.free === 0;
            const occupancyLabel = fullyBooked
              ? ', complet rezervat'
              : occupied
                ? ', parțial rezervat'
                : '';
            return (
              <Pressable
                key={iso}
                testID={`calendar-day:${iso}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${formatLongDate(iso)}${isToday ? ', azi' : ''}${occupancyLabel}${summary ? `${hasHalls ? `, ${summary.free} săli libere` : ', nicio sală activă în acest filtru'}, ${summary.confirmed} confirmate, ${summary.tentative} provizorii` : ', date indisponibile'}`}
                onPress={() => onSelect(iso)}
                style={styles.cell}
              >
                <View
                  style={[
                    styles.day,
                    occupied ? styles.occupied : undefined,
                    fullyBooked ? styles.full : undefined,
                    isToday ? styles.today : undefined,
                    isSelected ? styles.selected : undefined,
                    fullyBooked && isSelected ? styles.selectedFull : undefined,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[
                      styles.dayText,
                      occupied ? styles.occupiedText : undefined,
                      date.month() !== first.month()
                        ? styles.otherMonth
                        : undefined,
                      isSelected ? styles.selectedText : undefined,
                      fullyBooked ? styles.fullText : undefined,
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
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
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
    width: theme.spacing.xxl + theme.spacing.sm,
    minWidth: 0,
    minHeight: theme.spacing.xxl + theme.spacing.sm,
    maxWidth: '100%',
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
  full: {
    backgroundColor: theme.colors.menu.success,
    borderColor: theme.colors.menu.success,
  },
  fullText: { color: theme.colors.menu.surface },
  selectedFull: { backgroundColor: theme.colors.menu.success },
  otherMonth: { color: theme.colors.menu.muted, fontFamily: theme.fonts.body },
  today: { borderColor: theme.colors.menu.primary },
  selected: {
    backgroundColor: theme.colors.menu.primary,
    borderColor: theme.colors.menu.primary,
    borderRadius: theme.radius.md,
  },
  selectedText: { color: theme.colors.menu.surface },
});
