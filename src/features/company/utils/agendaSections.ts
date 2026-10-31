import { Booking } from '@/features/bookings/types';
import {
  companyNow,
  formatLongDate,
  formatMonthLabel,
} from '@/shared/utils/formatDate';

export type AgendaSection = {
  key: string;
  title: string;
  count: number;
  featured: boolean;
  data: Booking[];
};

export function buildAgendaSections(
  bookings: Booking[],
  collapsedMonths: ReadonlySet<string>,
  now = Date.now(),
): AgendaSection[] {
  const today = companyNow(now).format('YYYY-MM-DD');
  const upcoming = bookings.filter(
    booking =>
      ['confirmed', 'completed', 'tentative'].includes(booking.status) &&
      (booking.ends_at
        ? Date.parse(booking.ends_at) > now
        : booking.date >= today),
  );
  const nextDate = upcoming.reduce<string | undefined>(
    (earliest, booking) =>
      booking.date >= today && (!earliest || booking.date < earliest)
        ? booking.date
        : earliest,
    undefined,
  );
  const nextDayBookings = upcoming.filter(booking => booking.date === nextDate);
  const months = new Map<string, AgendaSection>();

  upcoming.forEach(booking => {
    if (booking.date === nextDate) return;
    const key = booking.date.slice(0, 7);
    const section: AgendaSection = months.get(key) ?? {
      key,
      title: formatMonthLabel(key),
      count: 0,
      featured: false,
      data: [],
    };
    section.count += 1;
    if (!collapsedMonths.has(key)) {
      section.data.push(booking);
    }
    months.set(key, section);
  });

  const sections: AgendaSection[] = nextDate
    ? [
        {
          key: `next:${nextDate}`,
          title: formatLongDate(nextDate),
          count: nextDayBookings.length,
          featured: true,
          data: nextDayBookings,
        },
      ]
    : [];
  return [...sections, ...months.values()];
}
