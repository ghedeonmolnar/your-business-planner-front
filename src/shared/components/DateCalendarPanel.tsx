import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Calendar, CalendarProps, DateData } from 'react-native-calendars';
import dayjs from 'dayjs';
import { calendarDayStyles } from '@/shared/components/calendarDayStyles';
import { CalendarYearPicker } from '@/shared/components/CalendarYearPicker';
import { IconButton } from '@/shared/components/IconButton';
import { theme } from '@/shared/theme/theme';
import { dateToIsoDate } from '@/shared/utils/dateInput';
import { formatLongDate } from '@/shared/utils/formatDate';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { LoadingState } from '@/shared/components/LoadingState';
import { dateCalendarPanelStyles as styles } from '@/shared/components/dateCalendarPanelStyles';

export type DateCalendarAvailability = {
  disabledDates: string[];
  loading: boolean;
  error?: unknown;
  unverified?: boolean;
  onRetry: () => unknown;
  onMonthChange: (date: string) => void;
};

type DateCalendarPanelProps = {
  panelStyle?: StyleProp<ViewStyle>;
  displayValue: string;
  maximumDate?: string;
  minimumDate?: string;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate: string;
  availability?: DateCalendarAvailability;
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
  panelStyle,
  displayValue,
  maximumDate,
  minimumDate,
  onClose,
  onSelect,
  selectedDate,
  availability,
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
  const selectionBlocked =
    availability?.loading || Boolean(availability?.error);
  const markedDates: CalendarProps['markedDates'] = {};
  const visibleMonth = dayjs(visibleDate).startOf('month');
  const previousMonthBlocked = Boolean(
    minimumDate && visibleDate.slice(0, 7) <= minimumDate.slice(0, 7),
  );
  const nextMonthBlocked = Boolean(
    maximumDate && visibleDate.slice(0, 7) >= maximumDate.slice(0, 7),
  );
  const disabledDates = selectionBlocked
    ? Array.from({ length: visibleMonth.daysInMonth() }, (_, day) =>
        visibleMonth.add(day, 'day').format('YYYY-MM-DD'),
      )
    : (availability?.disabledDates ?? []);
  for (const date of disabledDates) {
    markedDates[date] = {
      disabled: true,
      disableTouchEvent: true,
      accessibilityLabel: `${formatLongDate(date)}, ${
        selectionBlocked
          ? 'disponibilitate neconfirmată'
          : 'rezervată, indisponibilă'
      }`,
    };
  }
  if (selectedDate && !selectionBlocked && !markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: theme.colors.primary,
    };
  }

  const changeVisibleDate = (date: string) => {
    const allowedDate = clampIsoDate(date, minimumDate, maximumDate);
    setVisibleDate(allowedDate);
    availability?.onMonthChange(allowedDate);
  };

  const pickYear = (year: number) => {
    changeVisibleDate(
      clampIsoDate(
        `${year}-${visibleDate.slice(5, 7)}-01`,
        minimumDate,
        maximumDate,
      ),
    );
    setYearListOpen(false);
  };

  return (
    <Surface elevation={3} style={[styles.panel, panelStyle]}>
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
      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {availability?.loading ? <LoadingState /> : null}
        {availability?.unverified ? (
          <Text accessibilityRole="alert" style={styles.notice}>
            Disponibilitatea nu a fost actualizată. O vom verifica la salvare.
          </Text>
        ) : null}
        {availability?.error && !availability.loading ? (
          <ErrorBanner
            message="Nu am putut verifica disponibilitatea sălii."
            onRetry={availability.onRetry}
          />
        ) : null}
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
            disabledByDefault={selectionBlocked}
            disableArrowLeft={previousMonthBlocked}
            disableArrowRight={nextMonthBlocked}
            enableSwipeMonths
            firstDay={1}
            hideExtraDays
            markedDates={markedDates}
            maxDate={maximumDate}
            minDate={minimumDate}
            onPressArrowLeft={subtractMonth => {
              if (!previousMonthBlocked) subtractMonth();
            }}
            onPressArrowRight={addMonth => {
              if (!nextMonthBlocked) addMonth();
            }}
            onDayPress={(day: DateData) => {
              if (
                selectionBlocked ||
                markedDates[day.dateString]?.disabled ||
                (minimumDate && day.dateString < minimumDate) ||
                (maximumDate && day.dateString > maximumDate)
              )
                return;
              onSelect(day.dateString);
            }}
            onMonthChange={(month: DateData) =>
              changeVisibleDate(month.dateString)
            }
            renderArrow={direction => (
              <View
                style={[
                  styles.arrow,
                  (
                    direction === 'left'
                      ? previousMonthBlocked
                      : nextMonthBlocked
                  )
                    ? styles.disabledArrow
                    : undefined,
                ]}
              >
                <Ionicons
                  color={theme.colors.surface}
                  name={
                    direction === 'left' ? 'chevron-back' : 'chevron-forward'
                  }
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
      </ScrollView>
    </Surface>
  );
}
