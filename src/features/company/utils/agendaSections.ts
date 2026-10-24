import { Booking } from '@/features/bookings/types';
import { companyNow, formatMonthLabel } from '@/shared/utils/formatDate';

export type AgendaMonthSection = {
  key: string;
  title: string;
  count: number;
  data: Booking[];
};

export function buildAgendaSections(
  bookings: Booking[],
  collapsedMonths: ReadonlySet<string>,
  now = Date.now(),
) {
  const today = companyNow(now).format('YYYY-MM-DD');
  const upcoming = bookings.filter(
    booking =>
      (booking.status === 'confirmed' ||
        (booking.status === 'tentative' &&
          booking.expires_at !== null &&
          Date.parse(booking.expires_at) > now)) &&
      (booking.ends_at
        ? Date.parse(booking.ends_at) > now
        : booking.date >= today),
  );
  const [nextBooking, ...remaining] = upcoming;
  const months = new Map<string, AgendaMonthSection>();

  remaining.forEach(booking => {
    const key = booking.date.slice(0, 7);
    const section: AgendaMonthSection = months.get(key) ?? {
      key,
      title: formatMonthLabel(key),
      count: 0,
      data: [],
    };
    section.count += 1;
    if (!collapsedMonths.has(key)) {
      section.data.push(booking);
    }
    months.set(key, section);
  });

  return { nextBooking, sections: [...months.values()] };
}
