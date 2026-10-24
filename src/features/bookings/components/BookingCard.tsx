import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Booking } from '@/features/bookings/types';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { BookingStatusPill } from '@/features/bookings/components/BookingStatusPill';
import { RecordCard } from '@/shared/components/RecordCard';
import { InfoRow } from '@/shared/components/InfoRow';
import { theme } from '@/shared/theme/theme';
import { formatExactMoney } from '@/shared/utils/money';
import {
  formatCalendarDateParts,
  formatCompanyTimeRange,
  formatLongDate,
} from '@/shared/utils/formatDate';

export function BookingCard({
  booking,
  eventType,
  onOpen,
}: {
  booking: Booking;
  eventType: string;
  onOpen: () => void;
}) {
  const date = formatCalendarDateParts(booking.date);
  return (
    <RecordCard
      title={booking.client_name ?? 'Rezervare'}
      subtitle={eventType}
      badge={<BookingStatusPill status={booking.status} />}
      onPress={onOpen}
      accessibilityLabel={`Deschide rezervarea pentru ${booking.client_name ?? 'client necompletat'}, ${formatLongDate(booking.date)}, ${bookingStatusLabels[booking.status]}`}
      style={styles.card}
      leading={
        <View
          style={styles.date}
          accessible
          accessibilityLabel={formatLongDate(booking.date)}
        >
          <Text style={styles.meta}>{date.weekday}</Text>
          <Text style={styles.day}>{date.day}</Text>
          <Text style={styles.meta}>{date.month}</Text>
        </View>
      }
    >
      <InfoRow
        icon="business-outline"
        value={booking.hall_name ?? 'Sală necompletată'}
      />
      <InfoRow
        icon="time-outline"
        value={
          formatCompanyTimeRange(booking.starts_at, booking.ends_at) ??
          'Program necompletat'
        }
      />
      {booking.total_amount !== undefined ? (
        <InfoRow
          label="Valoare contract"
          value={formatExactMoney(booking.total_amount)}
          emphasized
        />
      ) : null}
    </RecordCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.sm },
  date: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: theme.colors.menu.border,
    paddingRight: theme.spacing.md,
    minWidth: theme.controls.fieldHeight,
  },
  day: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
  },
  meta: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
});
