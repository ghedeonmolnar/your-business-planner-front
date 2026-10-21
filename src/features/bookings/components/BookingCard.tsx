import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { Booking } from '@/features/bookings/types';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { AppButton } from '@/shared/components/AppButton';
import { MetaPill } from '@/shared/components/MetaPill';
import {
  formatLongDate,
  formatCompanyDateTime,
} from '@/shared/utils/formatDate';

export function BookingCard({
  booking,
  onOpen,
}: {
  booking: Booking;
  onOpen: () => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <MetaPill
          icon="calendar-outline"
          label={formatLongDate(booking.date)}
        />
        <MetaPill label={bookingStatusLabels[booking.status]} />
      </View>
      <Text style={styles.subtitle}>{booking.client_name ?? 'Rezervare'}</Text>
      <Text style={styles.text}>
        {booking.hall_name ?? 'Sală necompletată'}
      </Text>
      {booking.starts_at ? (
        <Text style={styles.muted}>
          {formatCompanyDateTime(booking.starts_at)}
        </Text>
      ) : null}
      <AppButton
        label="Deschide rezervarea"
        variant="ghost"
        icon="arrow-forward"
        iconPosition="right"
        onPress={onOpen}
      />
    </Card>
  );
}
