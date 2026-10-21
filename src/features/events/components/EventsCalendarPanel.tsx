import React, { ReactNode, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { Card } from '@/shared/components/Card';
import { Text } from 'react-native-paper';
import { Calendar, CalendarProps } from 'react-native-calendars';
import { EventPlanner } from '@/features/events/hooks/useEventPlanner';
import {
  CALENDAR_DAY_BORDER_WIDTH,
  CALENDAR_DAY_RADIUS,
  calendarDayStyles,
} from '@/shared/components/calendarDayStyles';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { LoadingState } from '@/shared/components/LoadingState';
import { isUnauthorizedError } from '@/shared/api/client';
import { theme } from '@/shared/theme/theme';
import { getErrorMessage } from '@/shared/utils/errorMessage';

const calendarTheme = {
  arrowColor: theme.colors.primary,
  todayTextColor: theme.colors.text,
  'stylesheet.day.basic': calendarDayStyles,
} as CalendarProps['theme'];

const dayMark = (
  backgroundColor: string,
  borderColor: string,
  textColor: string,
) => ({
  customStyles: {
    container: {
      backgroundColor,
      borderColor,
      borderRadius: CALENDAR_DAY_RADIUS,
      borderWidth: CALENDAR_DAY_BORDER_WIDTH,
    },
    text: { color: textColor },
  },
});

type EventsCalendarPanelProps = {
  header: ReactNode;
  planner: EventPlanner;
  onOpenEvent: (eventId: string) => void;
};

export function EventsCalendarPanel({
  header,
  planner,
  onOpenEvent,
}: EventsCalendarPanelProps) {
  const { monthEvents, monthEventsQuery, selectedDate } = planner;
  const todayDate = dayjs().format('YYYY-MM-DD');

  const markedDates = useMemo(() => {
    const marks: NonNullable<CalendarProps['markedDates']> = {};

    monthEvents.forEach(event => {
      marks[event.date] = dayMark(
        theme.colors.primary,
        'transparent',
        theme.colors.surface,
      );
    });

    marks[todayDate] = dayMark(
      theme.colors.surface,
      theme.colors.primary,
      theme.colors.text,
    );

    if (selectedDate) {
      marks[selectedDate] = dayMark(
        theme.colors.blueSoft,
        theme.colors.primary,
        theme.colors.text,
      );
    }

    return marks;
  }, [monthEvents, selectedDate, todayDate]);

  const selectedDayEvents = useMemo(
    () => monthEvents.filter(event => event.date === selectedDate),
    [monthEvents, selectedDate],
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {header}

      <Card style={styles.calendarPanel}>
        <Calendar
          current={selectedDate}
          markingType="custom"
          markedDates={markedDates}
          testID="events-calendar"
          onDayPress={(day: { dateString: string }) =>
            planner.setSelectedDate(day.dateString)
          }
          onMonthChange={(month: { dateString: string }) =>
            planner.setVisibleMonth(month.dateString.slice(0, 7))
          }
          theme={calendarTheme}
        />
      </Card>

      {monthEventsQuery.isLoading ? <LoadingState /> : null}
      {monthEventsQuery.error &&
      !isUnauthorizedError(monthEventsQuery.error) ? (
        <ErrorBanner
          message={getErrorMessage(
            monthEventsQuery.error,
            'Nu am putut încărca evenimentele lunii.',
          )}
          onRetry={() => monthEventsQuery.refetch()}
        />
      ) : null}

      <View style={styles.dayEventsSection}>
        <Text style={styles.sectionTitle}>Evenimente în ziua selectată</Text>
        {selectedDayEvents.length ? (
          selectedDayEvents.map(event => (
            <TouchableOpacity
              key={event.id}
              accessibilityRole="button"
              activeOpacity={0.72}
              onPress={() => onOpenEvent(event.id)}
              style={styles.dayEventRow}
            >
              <View style={styles.dayEventTime}>
                <Text style={styles.dayEventTimeText}>
                  {event.start_time && event.end_time
                    ? `${event.start_time} - ${event.end_time}`
                    : 'Ora necompletată'}
                </Text>
              </View>
              <View style={styles.dayEventInfo}>
                <Text style={styles.dayEventTitle}>
                  {event.location ?? 'Locație necompletată'}
                </Text>
                {event.address ? (
                  <Text numberOfLines={1} style={styles.dayEventMeta}>
                    {event.address}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        ) : monthEventsQuery.isLoading ? null : (
          <Text style={styles.emptyText}>
            Nu sunt evenimente în ziua selectată.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  calendarPanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.bodyLarge,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
  },
  dayEventsSection: {
    marginBottom: theme.spacing.lg,
  },
  dayEventRow: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  dayEventTime: {
    marginRight: theme.spacing.md,
    minWidth: 92,
  },
  dayEventTimeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.meta,
    fontWeight: '800',
  },
  dayEventInfo: {
    flex: 1,
  },
  dayEventTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  dayEventMeta: {
    color: theme.colors.muted,
    fontSize: theme.typography.label,
    marginTop: theme.spacing.xs,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: theme.typography.meta,
  },
});
