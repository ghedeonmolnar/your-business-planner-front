import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { EmployeeEvent } from '@/features/employeeWorkspace/types';
import { EmployeeEventCard } from '@/features/employeeWorkspace/components/EmployeeEventCard';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { LoadingState } from '@/shared/components/LoadingState';
import { isUnauthorizedError } from '@/shared/api/client';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { theme } from '@/shared/theme/theme';

type Props = {
  events: EmployeeEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectMonth: (month: string) => void;
  onOpenEvent: (event: EmployeeEvent) => void;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
};

export function EmployeeAgendaCalendar({
  events,
  selectedDate,
  onSelectDate,
  onSelectMonth,
  onOpenEvent,
  loading,
  error,
  onRetry,
}: Props) {
  const markedDates: Record<
    string,
    {
      marked?: boolean;
      dotColor?: string;
      selected?: boolean;
      selectedColor?: string;
    }
  > = {};

  events.forEach(event => {
    markedDates[event.date] = { marked: true, dotColor: theme.colors.primary };
  });
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: theme.colors.primary,
  };

  return (
    <View>
      <Calendar
        current={selectedDate}
        markedDates={markedDates}
        onDayPress={day => onSelectDate(day.dateString)}
        onMonthChange={month => onSelectMonth(month.dateString.slice(0, 7))}
        theme={{
          arrowColor: theme.colors.primary,
          todayTextColor: theme.colors.primary,
        }}
      />
      {loading ? <LoadingState /> : null}
      {error && !isUnauthorizedError(error) ? (
        <ErrorBanner
          message={getErrorMessage(error, 'Nu am putut încărca agenda.')}
          onRetry={onRetry}
        />
      ) : null}
      <Text style={styles.heading}>Evenimente în ziua selectată</Text>
      {events
        .filter(event => event.date === selectedDate)
        .map(event => (
          <EmployeeEventCard
            event={event}
            key={event.id}
            onDetails={onOpenEvent}
          />
        ))}
      {!loading &&
      !error &&
      !events.some(event => event.date === selectedDate) ? (
        <Text style={styles.empty}>Nu sunt evenimente în această zi.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  empty: { color: theme.colors.muted, fontSize: theme.typography.bodySmall },
});
