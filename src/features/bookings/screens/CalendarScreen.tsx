import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { useCalendar } from '@/features/bookings/hooks/useBookings';
import { useCalendarNavigation } from '@/features/bookings/hooks/useCalendarNavigation';
import { CalendarControls } from '@/features/bookings/components/CalendarControls';
import { CalendarLegend } from '@/features/bookings/components/CalendarLegend';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarYear } from '@/features/bookings/components/CalendarYear';
import { CalendarMonthSummary } from '@/features/bookings/components/CalendarMonthSummary';
import { CalendarDayHalls } from '@/features/bookings/components/CalendarDayHalls';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { getMonthStatistics } from '@/features/bookings/utils/calendarStatistics';
import { Screen } from '@/shared/components/Screen';
import { theme } from '@/shared/theme/theme';

export function CalendarScreen() {
  const calendarView = useCalendarNavigation();
  const [hallId, setHallId] = useState('');
  const [reservationHall, setReservationHall] = useState<string | null>(null);
  const filters = {
    date_from: calendarView.from,
    date_to: calendarView.to,
    hall_id: hallId || undefined,
  };
  const calendar = useCalendar(filters);
  const selectedMonth = calendarView.selected.slice(0, 7);
  const previousMonth = dayjs(calendarView.selected).subtract(1, 'month');
  const needsPreviousYear =
    calendarView.period === 'year' &&
    previousMonth.year() !== dayjs(calendarView.selected).year();
  const previousCalendar = useCalendar(
    {
      date_from: previousMonth.startOf('month').format('YYYY-MM-DD'),
      date_to: previousMonth.endOf('month').format('YYYY-MM-DD'),
      hall_id: hallId || undefined,
    },
    needsPreviousYear,
  );
  const days = calendar.data?.days ?? [];

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={calendar.isRefetching}
            onRefresh={() => calendar.refetch()}
          />
        }
      >
        <CalendarControls
          period={calendarView.period}
          selected={calendarView.selected}
          hallId={hallId}
          halls={calendar.data?.halls ?? []}
          onPeriod={calendarView.setPeriod}
          onMove={calendarView.move}
          onHall={setHallId}
          onToday={calendarView.today}
        />
        <CalendarLegend period={calendarView.period} />
        <QueryNotice
          loading={calendar.isLoading}
          error={calendar.error}
          retry={() => calendar.refetch()}
        />
        {calendar.data ? (
          calendarView.period === 'month' ? (
            <>
              <CalendarMonth
                month={selectedMonth}
                days={days}
                selected={calendarView.selected}
                onSelect={calendarView.selectDate}
              />
              <CalendarDayHalls
                date={calendarView.selected}
                hallId={hallId || undefined}
                free={
                  days.find(day => day.date === calendarView.selected)?.free
                }
                onReserve={setReservationHall}
              />
            </>
          ) : (
            <>
              <CalendarYear
                year={calendarView.selected.slice(0, 4)}
                selectedMonth={selectedMonth}
                days={days}
                onSelect={calendarView.selectMonth}
              />
              {needsPreviousYear ? (
                <QueryNotice
                  loading={previousCalendar.isLoading}
                  error={previousCalendar.error}
                  retry={() => previousCalendar.refetch()}
                />
              ) : null}
              <CalendarMonthSummary
                statistics={getMonthStatistics(selectedMonth, days)}
                previous={getMonthStatistics(
                  previousMonth.format('YYYY-MM'),
                  needsPreviousYear
                    ? (previousCalendar.data?.days ?? [])
                    : days,
                )}
                onOpen={() => calendarView.setPeriod('month')}
              />
            </>
          )
        ) : null}
      </ScrollView>
      {reservationHall !== null ? (
        <BookingForm
          date={calendarView.selected}
          hallId={
            reservationHall ||
            (calendar.data?.halls.find(hall => hall.id === hallId)?.is_active
              ? hallId
              : undefined)
          }
          onClose={() => setReservationHall(null)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.menu.background },
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
});
