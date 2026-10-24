import { Booking, BookingMonthCount } from '@/features/bookings/types';
import { formatMonthLabel } from '@/shared/utils/formatDate';

export const bookingCountLabel = (count: number) =>
  `${count} ${count === 1 ? 'rezervare' : 'rezervări'}`;

export const bookingSections = (
  bookings: Booking[],
  months: BookingMonthCount[],
  collapsed: ReadonlySet<string>,
) => {
  const grouped = new Map<string, Booking[]>();
  bookings.forEach(booking => {
    const month = booking.date.slice(0, 7);
    const entries = grouped.get(month) ?? [];
    entries.push(booking);
    grouped.set(month, entries);
  });
  return [...grouped].map(([month, entries]) => ({
    key: month,
    title: formatMonthLabel(month),
    total: months.find(count => count.month === month)?.total ?? entries.length,
    data: collapsed.has(month) ? [] : entries,
  }));
};
