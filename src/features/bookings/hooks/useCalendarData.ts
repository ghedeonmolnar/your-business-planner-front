import dayjs from 'dayjs';
import { useCalendar } from '@/features/bookings/hooks/useBookings';
import { CalendarPeriod } from '@/features/bookings/hooks/useCalendarNavigation';
import { getMonthStatistics } from '@/features/bookings/utils/calendarStatistics';

export function useCalendarData({
  selected,
  period,
  from,
  to,
  hallId,
  active,
}: {
  selected: string;
  period: CalendarPeriod;
  from: string;
  to: string;
  hallId: string;
  active: boolean;
}) {
  const year = Number(selected.slice(0, 4));
  const filters = (value: number) => ({
    date_from: `${value}-01-01`,
    date_to: `${value}-12-31`,
    hall_id: hallId || undefined,
  });
  const calendar = useCalendar(filters(year), active);
  const previousMonth = dayjs(selected).subtract(1, 'month');
  const statistics = getMonthStatistics(
    selected.slice(0, 7),
    calendar.data?.days ?? [],
  );
  const previousInCurrentYear = getMonthStatistics(
    previousMonth.format('YYYY-MM'),
    calendar.data?.days ?? [],
  );
  const needsAnnualComparison =
    period === 'year' &&
    statistics.complete &&
    statistics.bookings > 0 &&
    (!previousInCurrentYear.complete ||
      statistics.bookings <= previousInCurrentYear.bookings);
  const needsPreviousYear =
    from < `${year}-01-01` ||
    (period === 'year' && selected.slice(5, 7) === '01') ||
    needsAnnualComparison;
  const needsNextYear = to > `${year}-12-31`;
  const previousCalendar = useCalendar(
    filters(year - 1),
    active && needsPreviousYear,
  );
  const nextCalendar = useCalendar(filters(year + 1), active && needsNextYear);
  return {
    calendar,
    days: [
      ...(needsPreviousYear ? (previousCalendar.data?.days ?? []) : []),
      ...(calendar.data?.days ?? []),
      ...(needsNextYear ? (nextCalendar.data?.days ?? []) : []),
    ],
    statistics,
    previousStatistics:
      previousMonth.year() === year
        ? previousInCurrentYear
        : getMonthStatistics(
            previousMonth.format('YYYY-MM'),
            previousCalendar.data?.days ?? [],
          ),
    sameMonthLastYear: getMonthStatistics(
      dayjs(selected).subtract(1, 'year').format('YYYY-MM'),
      previousCalendar.data?.days ?? [],
    ),
    adjacentError: needsPreviousYear
      ? previousCalendar.error
      : needsNextYear
        ? nextCalendar.error
        : null,
    retryAdjacent: () =>
      needsPreviousYear ? previousCalendar.refetch() : nextCalendar.refetch(),
  };
}
