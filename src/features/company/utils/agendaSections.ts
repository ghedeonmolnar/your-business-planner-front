import { Booking } from '@/features/bookings/types';
import { formatMonthLabel } from '@/shared/utils/formatDate';

export type AgendaMonthSection = {
  key: string;
  title: string;
  count: number;
  data: Booking[];
};

export function buildAgendaSections(
  bookings: Booking[],
  collapsedMonths: ReadonlySet<string>,
) {
  const upcoming = bookings.filter(
    booking => booking.status === 'confirmed' || booking.status === 'tentative',
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
