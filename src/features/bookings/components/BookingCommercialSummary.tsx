import React from 'react';

import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { Booking } from '@/features/bookings/types';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { formatLongDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

export function BookingCommercialSummary({ booking }: { booking: Booking }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.text}>Minim garantat: {booking.minimum_guests}</Text>
      <Text style={styles.text}>
        Invitați finali: {booking.final_guests ?? 'Necompletat'}
      </Text>
      {booking.menu_name ? (
        <Text style={styles.text}>Meniu: {booking.menu_name}</Text>
      ) : null}
      <Text style={styles.text}>
        Preț meniu: {formatExactMoney(booking.menu_price)}
      </Text>
      <Text style={styles.text}>
        Minim contractual: {formatExactMoney(booking.minimum_amount)}
      </Text>
      {booking.extra_services?.length ? (
        <Text style={styles.text}>
          {booking.extra_services
            .map(
              service => service.name + ': ' + formatExactMoney(service.amount),
            )
            .join('\n')}
        </Text>
      ) : null}
      <Text style={styles.text}>
        Valoare estimată: {formatExactMoney(booking.total_amount)}
      </Text>
      <Text style={styles.text}>
        Avans convenit: {formatExactMoney(booking.agreed_advance)}
      </Text>
      {booking.advance_due_at ? (
        <Text style={styles.text}>
          Scadența avansului: {formatLongDate(booking.advance_due_at)}
        </Text>
      ) : null}
      <Text style={styles.text}>
        Încasat: {formatExactMoney(booking.paid_amount)}
      </Text>
      <Text style={styles.text}>
        Rest: {formatExactMoney(booking.balance_due)}
      </Text>
      <Text style={styles.text}>
        Cost estimat personal: {formatExactMoney(booking.employee_cost)}
      </Text>
      <Text style={styles.muted}>{booking.notes}</Text>
    </Card>
  );
}
