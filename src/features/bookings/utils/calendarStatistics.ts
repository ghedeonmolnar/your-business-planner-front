import dayjs from 'dayjs';
import { CalendarDay } from '@/features/bookings/types';
import { formatMonthName } from '@/shared/utils/formatDate';

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
  for (const day of monthDays) {
    const occupied = day.confirmed + day.tentative;
    bookings += occupied;
    availableSlots += occupied + day.free;
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
    occupancy: availableSlots ? bookings / availableSlots : 0,
    hasHalls: availableSlots > 0,
    complete: monthDays.length === totalDays,
  };
}

export type MonthStatistics = ReturnType<typeof getMonthStatistics>;

export function occupancyLabel(statistics: MonthStatistics) {
  if (!statistics.complete) return 'Date indisponibile';
  if (!statistics.hasHalls) return 'Fără săli';
  if (statistics.bookings === 0) return 'Liber';
  if (statistics.occupancy < MODERATE_OCCUPANCY) return 'Mai liber';
  if (statistics.occupancy < HIGH_OCCUPANCY) return 'Moderat';
  if (statistics.occupancy < VERY_HIGH_OCCUPANCY) return 'Aglomerat';
  return 'Foarte aglomerat';
}

export function bookingComparison(
  current: MonthStatistics,
  previous: MonthStatistics,
) {
  if (!current.complete || !previous.complete)
    return 'Rezervări în această lună';
  const difference = current.bookings - previous.bookings;
  const previousName = formatMonthName(previous.month);
  if (!difference) return `La fel ca în ${previousName}`;
  if (!previous.bookings)
    return `${difference} ${difference === 1 ? 'rezervare' : 'rezervări'} în plus față de ${previousName}`;
  const percentage = Math.round(
    (Math.abs(difference) / previous.bookings) * 100,
  );
  return `Cu ${percentage}% mai ${difference > 0 ? 'mult' : 'puțin'} decât în ${previousName}`;
}
