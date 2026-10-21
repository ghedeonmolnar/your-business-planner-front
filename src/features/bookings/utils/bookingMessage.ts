import { Booking } from '@/features/bookings/types';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import {
  formatCompanyDateTime,
  formatLongDate,
} from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

export const bookingMessage = (booking: Booking, companyName: string) =>
  [
    companyName,
    booking.client_name,
    formatLongDate(booking.date) + ' · ' + booking.hall_name,
    bookingStatusLabels[booking.status],
    'Început: ' + formatCompanyDateTime(booking.starts_at),
    'Sfârșit: ' + formatCompanyDateTime(booking.ends_at),
    'Meniu: ' + (booking.menu_name || 'Conform discuției'),
    'Preț meniu: ' + formatExactMoney(booking.menu_price),
    'Minim garantat: ' + booking.minimum_guests + ' invitați',
    booking.final_guests == null
      ? ''
      : 'Invitați finali: ' + booking.final_guests,
    'Valoare estimată: ' + formatExactMoney(booking.total_amount),
    booking.paid_amount === undefined
      ? ''
      : 'Încasat: ' + formatExactMoney(booking.paid_amount),
    booking.balance_due === undefined
      ? ''
      : 'Rest: ' + formatExactMoney(booking.balance_due),
    ...(booking.extra_services ?? []).map(
      service => service.name + ': ' + formatExactMoney(service.amount),
    ),
    booking.notes ?? '',
  ]
    .filter(Boolean)
    .join('\n');
