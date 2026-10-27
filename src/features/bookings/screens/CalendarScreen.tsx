import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { useIsFocused } from '@react-navigation/native';
import { useCalendar } from '@/features/bookings/hooks/useBookings';
import { useCalendarNavigation } from '@/features/bookings/hooks/useCalendarNavigation';
import { CalendarControls } from '@/features/bookings/components/CalendarControls';
import { CalendarLegend } from '@/features/bookings/components/CalendarLegend';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarYear } from '@/features/bookings/components/CalendarYear';
import { CalendarMonthSummary } from '@/features/bookings/components/CalendarMonthSummary';
import { CalendarDayHalls } from '@/features/bookings/components/CalendarDayHalls';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { QueryState } from '@/shared/components/QueryState';
import { getMonthStatistics } from '@/features/bookings/utils/calendarStatistics';
import { Screen } from '@/shared/components/Screen';
import { theme } from '@/shared/theme/theme';
import { DirectoryItem } from '@/features/company/types';
import { useCalendarRefresh } from '@/features/bookings/hooks/useCalendarRefresh';
import { HallScreenHeader } from '@/features/halls/components/HallScreenHeader';
import { CalendarDataFreshness } from '@/features/bookings/components/CalendarDataFreshness';

export function CalendarScreen({
  initialHallId = '',
  onBack,
}: { initialHallId?: string; onBack?: () => void } = {}) {
  const calendarView = useCalendarNavigation();
  const focused = useIsFocused();
  const [hallId, setHallId] = useState(initialHallId);
  const [reservationHall, setReservationHall] =
    useState<DirectoryItem | null>();
  const refresh = useCalendarRefresh();
  const filters = {
    date_from: calendarView.from,
    date_to: calendarView.to,
    hall_id: hallId || undefined,
  };
  const calendar = useCalendar(filters, focused);
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
    needsPreviousYear && focused,
  );
  const days = calendar.data?.days ?? [];

  return (
    <Screen style={styles.screen}>
      {onBack ? (
        <HallScreenHeader
          title="Disponibilitate sală"
          subtitle="Calendarul rezervărilor"
          onBack={onBack}
        />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refresh.refreshing}
            onRefresh={refresh.refresh}
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
          onSelectMonth={calendarView.selectMonth}
        />
        <CalendarLegend period={calendarView.period} />
        <QueryState
          loading={calendar.isLoading}
          error={calendar.error}
          retry={() => calendar.refetch()}
        />
        <CalendarDataFreshness
          label="Sumar calendar"
          updatedAt={calendar.dataUpdatedAt}
          fetching={calendar.isFetching}
          stale={calendar.isError || calendar.isStale}
        />
        {calendar.data ? (
          calendarView.period === 'month' ? (
            <>
              <CalendarMonth
                month={selectedMonth}
                days={days}
                selected={calendarView.selected}
                hasHalls={calendar.data.halls.some(
                  hall => hall.is_active && (!hallId || hall.id === hallId),
                )}
                onSelect={calendarView.selectDate}
              />
              <CalendarDayHalls
                date={calendarView.selected}
                hallId={hallId || undefined}
                onReserve={setReservationHall}
                active={focused}
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
                <>
                  <QueryState
                    loading={previousCalendar.isLoading}
                    error={previousCalendar.error}
                    retry={() => previousCalendar.refetch()}
                  />
                  <CalendarDataFreshness
                    label="Sumar luna precedentă"
                    updatedAt={previousCalendar.dataUpdatedAt}
                    fetching={previousCalendar.isFetching}
                    stale={previousCalendar.isError || previousCalendar.isStale}
                  />
                </>
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
      {reservationHall !== undefined ? (
        <BookingForm
          date={calendarView.selected}
          hallId={
            reservationHall?.id ||
            (calendar.data?.halls.find(hall => hall.id === hallId)?.is_active
              ? hallId
              : undefined)
          }
          selectedHall={
            reservationHall ??
            calendar.data?.halls.find(hall => hall.id === hallId)
          }
          onClose={() => setReservationHall(undefined)}
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
