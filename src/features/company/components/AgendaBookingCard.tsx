import React from 'react';
import { Booking } from '@/features/bookings/types';
import { BookingStatusPill } from '@/features/bookings/components/BookingStatusPill';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { RecordCard } from '@/shared/components/RecordCard';
import { InfoRow } from '@/shared/components/InfoRow';
import { formatCompanyTime, formatLongDate } from '@/shared/utils/formatDate';

type AgendaBookingCardProps = {
  booking: Booking;
  featured?: boolean;
  onOpen: () => void;
};

export function AgendaBookingCard({
  booking,
  featured = false,
  onOpen,
}: AgendaBookingCardProps) {
  const hallName = booking.hall_name ?? 'Sală necompletată';
  const schedule = `${formatLongDate(booking.date)} · ${formatCompanyTime(booking.starts_at)}`;
  return (
    <RecordCard
      title={booking.client_name ?? 'Client necompletat'}
      highlighted={featured}
      badge={<BookingStatusPill status={booking.status} />}
      onPress={onOpen}
      accessibilityLabel={`Deschide rezervarea pentru ${booking.client_name ?? 'client necompletat'}`}
      accessibilityHint={`${hallName}, ${schedule}, ${bookingStatusLabels[booking.status]}.`}
    >
      <InfoRow
        icon="business-outline"
        highlighted={featured}
        value={hallName}
      />
      <InfoRow
        icon="calendar-outline"
        highlighted={featured}
        value={schedule}
      />
    </RecordCard>
  );
}
