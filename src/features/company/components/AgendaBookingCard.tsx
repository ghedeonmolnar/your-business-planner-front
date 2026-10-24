import React from 'react';
import { Booking } from '@/features/bookings/types';
import { BookingStatusPill } from '@/features/bookings/components/BookingStatusPill';
import { RecordCard } from '@/shared/components/RecordCard';
import { InfoRow } from '@/shared/components/InfoRow';
import { MetaPill } from '@/shared/components/MetaPill';
import { AppButton } from '@/shared/components/AppButton';
import { formatCompanyTime, formatLongDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

type AgendaBookingCardProps = {
  booking: Booking;
  featured?: boolean;
  first?: boolean;
  last?: boolean;
  showFinance: boolean;
  onOpen: () => void;
};

export function AgendaBookingCard({
  booking,
  featured = false,
  showFinance,
  onOpen,
}: AgendaBookingCardProps) {
  return (
    <RecordCard
      title={booking.client_name ?? 'Client necompletat'}
      highlighted={featured}
      badge={<BookingStatusPill status={booking.status} />}
      actions={
        <AppButton
          accessibilityLabel={`Deschide rezervarea pentru ${booking.client_name ?? 'client necompletat'}`}
          label="Deschide rezervarea"
          icon="arrow-forward"
          iconPosition="right"
          onPress={onOpen}
          size="small"
          variant="ghost"
        />
      }
    >
      {featured ? (
        <MetaPill tone="primary" icon="flash" label="Urmează cel mai curând" />
      ) : null}
      <InfoRow
        icon="business-outline"
        highlighted={featured}
        value={booking.hall_name ?? 'Sală necompletată'}
      />
      <InfoRow
        icon="calendar-outline"
        highlighted={featured}
        value={formatLongDate(booking.date)}
      />
      <InfoRow
        icon="time-outline"
        highlighted={featured}
        value={formatCompanyTime(booking.starts_at)}
      />
      {showFinance && booking.paid_amount !== undefined ? (
        <InfoRow
          icon="wallet-outline"
          label="Încasat"
          value={formatExactMoney(booking.paid_amount)}
          emphasized
        />
      ) : null}
    </RecordCard>
  );
}
