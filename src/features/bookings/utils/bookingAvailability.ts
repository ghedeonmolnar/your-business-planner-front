import dayjs from 'dayjs';
import { API_URL } from '@env';
import { AuthUser } from '@/features/auth/types';
import { CalendarSummary } from '@/features/bookings/types';
import { CalendarAvailabilityWindow } from '@/shared/storage/calendarAvailabilitySchema';

const AVAILABILITY_MONTHS = 6;

export const bookingAvailabilityOwner = (user: AuthUser | null) =>
  user?.company
    ? [
        encodeURIComponent(API_URL),
        user.company.id,
        user.id,
        user.role,
        user.employee_id ?? '',
      ].join('|')
    : '';

export const bookingAvailabilityRange = (
  month: string,
  windows: Pick<CalendarAvailabilityWindow, 'from' | 'to'>[],
) => {
  const date = dayjs(`${month}-01`);
  const covered = windows.find(
    window =>
      window.from <= date.format('YYYY-MM-DD') &&
      window.to >= date.endOf('month').format('YYYY-MM-DD'),
  );
  if (covered) return { from: covered.from, to: covered.to };
  const nearest = [...windows].sort(
    (a, b) =>
      Math.abs(date.diff(dayjs(a.from), 'month')) -
      Math.abs(date.diff(dayjs(b.from), 'month')),
  )[0];
  const origin = nearest ? dayjs(nearest.from) : date;
  const offset = Math.floor(date.diff(origin, 'month') / AVAILABILITY_MONTHS);
  const from = origin.add(offset * AVAILABILITY_MONTHS, 'month');
  return {
    from: from.format('YYYY-MM-DD'),
    to: from
      .add(AVAILABILITY_MONTHS - 1, 'month')
      .endOf('month')
      .format('YYYY-MM-DD'),
  };
};

export const bookingAvailabilityWindow = (
  summary: CalendarSummary,
  context: {
    owner: string;
    hallId: string;
    excludedEventId?: string;
    from: string;
    to: string;
  },
): CalendarAvailabilityWindow => {
  const revision = summary.availability_revision ?? summary.revision;
  const dates = new Set(summary.days.map(day => day.date));
  const expected = dayjs(context.to).diff(dayjs(context.from), 'day') + 1;
  if (
    !revision ||
    dates.size !== expected ||
    summary.days.some(day => day.date < context.from || day.date > context.to)
  )
    throw new Error('CALENDAR_AVAILABILITY_INCOMPLETE');
  return {
    ...context,
    occupiedDates: summary.days
      .filter(day => (day.occupied_halls ?? day.confirmed) > 0)
      .map(day => day.date),
    revision,
    invalidated: false,
    lastUsedAt: Date.now(),
  };
};
