import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useCalendarData } from '@/features/bookings/hooks/useCalendarData';
import { useCalendarSync } from '@/features/bookings/hooks/useCalendarSync';
import { useCalendarNavigation } from '@/features/bookings/hooks/useCalendarNavigation';
import { CalendarControls } from '@/features/bookings/components/CalendarControls';
import { CalendarLegend } from '@/features/bookings/components/CalendarLegend';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarYear } from '@/features/bookings/components/CalendarYear';
import { CalendarMonthSummary } from '@/features/bookings/components/CalendarMonthSummary';
import { CalendarDayHalls } from '@/features/bookings/components/CalendarDayHalls';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { QueryState } from '@/shared/components/QueryState';
import { Screen } from '@/shared/components/Screen';
import { theme } from '@/shared/theme/theme';
import { DirectoryItem } from '@/features/company/types';
import { useCalendarRefresh } from '@/features/bookings/hooks/useCalendarRefresh';
import { HallScreenHeader } from '@/features/halls/components/HallScreenHeader';
import { CalendarDataFreshness } from '@/features/bookings/components/CalendarDataFreshness';

export function CalendarScreen({
  initialHallId = '',
  initialDate,
  headerTitle = 'Disponibilitate sală',
  onBack,
}: {
  initialHallId?: string;
  initialDate?: string;
  headerTitle?: string;
  onBack?: () => void;
} = {}) {
  const calendarView = useCalendarNavigation(initialDate);
  const focused = useIsFocused();
  const [hallId, setHallId] = useState(initialHallId);
  const [reservationHall, setReservationHall] =
    useState<DirectoryItem | null>();
  const refresh = useCalendarRefresh();
  const {
    calendar,
    days,
    statistics,
    previousStatistics,
    sameMonthLastYear,
    adjacentError,
    retryAdjacent,
  } = useCalendarData({
    selected: calendarView.selected,
    period: calendarView.period,
    from: calendarView.from,
    to: calendarView.to,
    hallId,
    active: focused,
  });
  const synchronization = useCalendarSync(focused);
  const selectedMonth = calendarView.selected.slice(0, 7);

  return (
    <Screen style={styles.screen}>
      {onBack ? (
        <HallScreenHeader
          title={headerTitle}
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
          onSelectMonth={calendarView.selectMonth}
        />
        {calendarView.period === 'month' ? <CalendarLegend /> : null}
        <QueryState
          loading={calendar.isLoading}
          error={calendar.error}
          retry={() => calendar.refetch()}
        />
        <QueryState
          loading={false}
          error={synchronization.error}
          fallbackMessage="Nu am putut verifica actualizările calendarului."
          retry={() => synchronization.refetch()}
        />
        <QueryState
          loading={false}
          error={adjacentError}
          retry={retryAdjacent}
        />
        <CalendarDataFreshness
          label="Sumar calendar"
          updatedAt={calendar.dataUpdatedAt}
          fetching={calendar.isFetching}
          stale={calendar.isError || synchronization.isError}
          offline={calendar.fetchStatus === 'paused'}
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
              <CalendarMonthSummary
                statistics={statistics}
                previous={previousStatistics}
                sameMonthLastYear={sameMonthLastYear}
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
