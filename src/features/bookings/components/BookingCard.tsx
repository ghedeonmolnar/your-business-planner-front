import React from 'react';

import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { Booking } from '@/features/bookings/types';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { AppButton } from '@/shared/components/AppButton';
import { formatLongDate } from '@/shared/utils/formatDate';

export function BookingCard({
  booking,
  onOpen,
}: {
  booking: Booking;
  onOpen: () => void;
}) {
  return (
    <Card style={styles.card}>
      <Text style={styles.subtitle}>
        {booking.client_name ?? 'Rezervare'} · {booking.hall_name}
      </Text>
      <Text style={styles.text}>
        {formatLongDate(booking.date)} · {bookingStatusLabels[booking.status]}
      </Text>
      <AppButton
        label="Deschide rezervarea"
        variant="outline"
        onPress={onOpen}
      />
    </Card>
  );
}
