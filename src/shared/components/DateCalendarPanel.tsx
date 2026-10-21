import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Calendar, CalendarProps, DateData } from 'react-native-calendars';
import { calendarDayStyles } from '@/shared/components/calendarDayStyles';
import { CalendarYearPicker } from '@/shared/components/CalendarYearPicker';
import { IconButton } from '@/shared/components/IconButton';
import { theme } from '@/shared/theme/theme';
import { dateToIsoDate } from '@/shared/utils/dateInput';

type DateCalendarPanelProps = {
  displayValue: string;
  maximumDate?: string;
  minimumDate?: string;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate: string;
};

const clampIsoDate = (
  date: string,
  minimumDate?: string,
  maximumDate?: string,
) => {
  if (minimumDate && date < minimumDate) {
    return minimumDate;
  }

  if (maximumDate && date > maximumDate) {
    return maximumDate;
  }

  return date;
};

const yearOf = (isoDate: string) => Number(isoDate.slice(0, 4));

export function DateCalendarPanel({
  displayValue,
  maximumDate,
  minimumDate,
  onClose,
  onSelect,
  selectedDate,
}: DateCalendarPanelProps) {
  const [visibleDate, setVisibleDate] = useState(() =>
    clampIsoDate(
      selectedDate || dateToIsoDate(new Date()),
      minimumDate,
      maximumDate,
    ),
  );
  const [isYearListOpen, setYearListOpen] = useState(false);
  const yearRange =
    minimumDate && maximumDate && yearOf(minimumDate) !== yearOf(maximumDate)
      ? { minimum: yearOf(minimumDate), maximum: yearOf(maximumDate) }
      : null;
  const visibleYear = yearOf(visibleDate);

  const pickYear = (year: number) => {
    setVisibleDate(
      clampIsoDate(
        `${year}-${visibleDate.slice(5, 7)}-01`,
        minimumDate,
        maximumDate,
      ),
    );
    setYearListOpen(false);
  };

  return (
    <Surface elevation={3} style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Data selectată</Text>
          <Text style={styles.title}>{displayValue || 'Alege o dată'}</Text>
        </View>
        <IconButton
          accessibilityLabel="Închide calendarul"
          icon="close"
          onPress={onClose}
        />
      </View>
      {yearRange ? (
        <Pressable
          accessibilityLabel="Alege anul"
          accessibilityRole="button"
          accessibilityState={{ expanded: isYearListOpen }}
          accessibilityValue={{ text: String(visibleYear) }}
          onPress={() => setYearListOpen(open => !open)}
          style={styles.yearToggle}
        >
          <Text style={styles.yearToggleText}>Anul {visibleYear}</Text>
          <Ionicons
            color={theme.colors.primary}
            name={isYearListOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
          />
        </Pressable>
      ) : null}
      {yearRange && isYearListOpen ? (
        <CalendarYearPicker
          maximumYear={yearRange.maximum}
          minimumYear={yearRange.minimum}
          onSelect={pickYear}
          selectedYear={visibleYear}
        />
      ) : (
        <Calendar
          current={visibleDate}
          disableAllTouchEventsForDisabledDays
          enableSwipeMonths
          firstDay={1}
          hideExtraDays
          markedDates={
            selectedDate
              ? {
                  [selectedDate]: {
                    selected: true,
                    selectedColor: theme.colors.primary,
                  },
                }
              : undefined
          }
          maxDate={maximumDate}
          minDate={minimumDate}
          onDayPress={(day: DateData) => onSelect(day.dateString)}
          onMonthChange={(month: DateData) => setVisibleDate(month.dateString)}
          renderArrow={direction => (
            <View style={styles.arrow}>
              <Ionicons
                color={theme.colors.surface}
                name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
                size={18}
              />
            </View>
          )}
          theme={
            {
              arrowColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              monthTextColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.surface,
              'stylesheet.day.basic': calendarDayStyles,
              textDayHeaderFontFamily: theme.fonts.bodySemibold,
              textDayHeaderFontSize: 13,
              textDisabledColor: theme.colors.disabled,
              textMonthFontFamily: theme.fonts.heading,
              textMonthFontSize: 17,
              textSectionTitleColor: theme.colors.muted,
              todayTextColor: theme.colors.primary,
            } as CalendarProps['theme']
          }
        />
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    maxWidth: 440,
    overflow: 'hidden',
    padding: theme.spacing.md,
    width: '100%',
    ...theme.shadow,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  eyebrow: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
    marginTop: 2,
  },
  yearToggle: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minHeight: 44,
    paddingHorizontal: theme.spacing.xs,
  },
  yearToggleText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
  },
  arrow: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
