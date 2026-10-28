import dayjs from 'dayjs';
import { CalendarDay } from '@/features/bookings/types';
import { formatMonthLabel } from '@/shared/utils/formatDate';

const SATURDAY = 6;
const SUNDAY = 0;
const MODERATE_OCCUPANCY = 1 / 3;
const HIGH_OCCUPANCY = 2 / 3;
const VERY_HIGH_OCCUPANCY = 0.85;

export function getMonthStatistics(month: string, days: CalendarDay[]) {
  const monthDays = days.filter(day => day.date.startsWith(`${month}-`));
  const weekends = new Set<string>();
  const occupiedWeekends = new Set<string>();
  let bookings = 0;
  let freeDays = 0;
  let availableSlots = 0;
  let occupiedSlots = 0;
  for (const day of monthDays) {
    const occupied = day.active_occupied_halls ?? 0;
    occupiedSlots += occupied;
    bookings += day.confirmed + day.tentative;
    availableSlots += day.active_capacity ?? 0;
    if (occupied === 0 && day.free > 0) {
      freeDays += 1;
    }
    const date = dayjs(day.date);
    if (date.day() === SATURDAY || date.day() === SUNDAY) {
      const weekend = date
        .subtract(date.day() === SUNDAY ? 1 : 0, 'day')
        .format('YYYY-MM-DD');
      weekends.add(weekend);
      if (occupied > 0) {
        occupiedWeekends.add(weekend);
      }
    }
  }
  const totalDays = dayjs(`${month}-01`).daysInMonth();
  return {
    month,
    bookings,
    freeDays,
    totalDays,
    weekends: weekends.size,
    occupiedWeekends: occupiedWeekends.size,
    occupancy: availableSlots ? occupiedSlots / availableSlots : 0,
    hasHalls: availableSlots > 0,
    complete:
      monthDays.length === totalDays &&
      monthDays.every(
        day =>
          day.active_capacity !== undefined &&
          day.active_occupied_halls !== undefined,
      ),
  };
}

export type MonthStatistics = ReturnType<typeof getMonthStatistics>;

export function occupancyLabel(statistics: MonthStatistics) {
  if (!statistics.complete) return 'Date indisponibile';
  if (!statistics.hasHalls) return 'Fără săli';
  if (statistics.occupancy === 0) return 'Liber';
  if (statistics.occupancy < MODERATE_OCCUPANCY) return 'Mai liber';
  if (statistics.occupancy < HIGH_OCCUPANCY) return 'Moderat';
  if (statistics.occupancy < VERY_HIGH_OCCUPANCY) return 'Aglomerat';
  return 'Foarte aglomerat';
}

export function bookingComparison(
  current: MonthStatistics,
  previous: MonthStatistics,
  sameMonthLastYear?: MonthStatistics,
) {
  const neutral = 'Rezervări în această lună';
  if (!current.complete) return neutral;
  const month = dayjs(`${current.month}-01`);
  const monthlyGrowth =
    previous.complete &&
    previous.month === month.subtract(1, 'month').format('YYYY-MM') &&
    current.bookings > previous.bookings;
  const annualGrowth =
    sameMonthLastYear?.complete &&
    sameMonthLastYear.month === month.subtract(1, 'year').format('YYYY-MM') &&
    sameMonthLastYear.bookings > 0 &&
    current.bookings > sameMonthLastYear.bookings;
  const comparison = monthlyGrowth
    ? previous
    : annualGrowth
      ? sameMonthLastYear
      : undefined;
  if (!comparison) return neutral;
  const difference = current.bookings - comparison.bookings;
  const percentage =
    comparison.bookings > 0
      ? Math.round((difference / comparison.bookings) * 100)
      : 0;
  const period = formatMonthLabel(comparison.month);
  return percentage > 0
    ? `+${percentage}% față de ${period}`
    : `${difference} ${difference === 1 ? 'rezervare' : 'rezervări'} în plus față de ${period}`;
}
