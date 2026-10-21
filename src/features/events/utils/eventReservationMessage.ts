import { Event } from '@/features/events/types';
import { eventMascotLabel } from '@/features/events/utils/eventMascotLabel';
import {
  formatCompactTimeRange,
  formatDayMonthDate,
} from '@/shared/utils/formatDate';
import { formatMoneyInWords } from '@/shared/utils/money';

export const buildEventReservationMessage = (
  event: Event,
  mascotNamesById: Map<string, string>,
) => {
  const timeRange = formatCompactTimeRange(event.start_time, event.end_time);
  const characters = eventMascotLabel(event, mascotNamesById, ' & ');
  const location = [event.address?.trim(), event.location?.trim()]
    .filter(Boolean)
    .join(', ');
  const price =
    timeRange && event.total_amount !== undefined
      ? formatMoneyInWords(event.total_amount)
      : 'De confirmat';

  return [
    'Detaliile rezervării:',
    `Data: ${formatDayMonthDate(event.date)}`,
    `Interval orar: ${timeRange ?? 'De confirmat'}`,
    `Personaje: ${characters || 'De confirmat'}`,
    `Locație: ${location || 'De confirmat'}`,
    `Preț: ${price}`,
  ].join('\n');
};
