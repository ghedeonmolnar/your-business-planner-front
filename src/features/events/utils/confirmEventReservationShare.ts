import { Event } from '@/features/events/types';
import { buildEventReservationMessage } from '@/features/events/utils/eventReservationMessage';
import { confirmAction } from '@/shared/feedback/confirmAction';
import {
  eventContactPhone,
  openWhatsAppShare,
} from '@/shared/utils/contactLinks';
import { formatLongDate } from '@/shared/utils/formatDate';

export const confirmEventReservationShare = (
  event: Event,
  mascotNamesById: Map<string, string>,
) => {
  confirmAction({
    title: 'Felicitări!',
    message: `Ai introdus evenimentul din ${formatLongDate(event.date)}.\n\nVrei să trimiți detaliile rezervării și clientului?`,
    confirmLabel: 'Da, trimite',
    cancelLabel: 'Nu',
    onConfirm: () => {
      return openWhatsAppShare(
        eventContactPhone(event),
        buildEventReservationMessage(event, mascotNamesById),
      );
    },
  });
};
