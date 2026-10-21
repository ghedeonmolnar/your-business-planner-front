import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { BookingPaymentForm } from '@/features/bookings/components/BookingPaymentForm';
import { BookingPayment } from '@/features/bookings/schemas/bookingFinanceSchemas';
import {
  useBookingPayments,
  useCancelBookingPayment,
} from '@/features/bookings/hooks/useBookingFinance';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { formatExactMoney } from '@/shared/utils/money';
import { formatLongDate } from '@/shared/utils/formatDate';

export function BookingPayments({ eventId }: { eventId: string }) {
  const query = useBookingPayments(eventId);
  const cancel = useCancelBookingPayment(eventId);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BookingPayment | null>(null);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <View style={styles.content}>
      <Text style={styles.subtitle}>Încasări și cheltuieli</Text>
      <AppButton
        label="Adaugă încasare sau cheltuială"
        onPress={() => setCreating(true)}
      />
      <QueryNotice
        loading={query.isLoading}
        error={query.error}
        empty={!items.length}
        retry={() => query.refetch()}
      />
      {items.map(payment => (
        <Card key={payment.id} style={styles.card}>
          <Text style={styles.text}>
            {payment.type === 'incoming' ? 'Încasare' : 'Cheltuială'} ·{' '}
            {formatExactMoney(payment.amount)}
          </Text>
          <Text style={styles.muted}>
            {formatLongDate(payment.paid_at)} ·{' '}
            {payment.status === 'completed'
              ? 'Efectuată'
              : payment.status === 'cancelled'
                ? 'Anulată'
                : 'În așteptare'}
          </Text>
          {payment.status !== 'cancelled' ? (
            <View style={styles.row}>
              <AppButton
                label="Editează plata"
                variant="outline"
                onPress={() => setEditing(payment)}
              />
              <AppButton
                label="Anulează plata"
                variant="ghost"
                disabled={cancel.isPending}
                onPress={() =>
                  confirmAction({
                    title: 'Anulezi plata?',
                    message:
                      'Înregistrarea rămâne în istoric și nu mai intră în sold.',
                    confirmLabel: 'Anulează plata',
                    onConfirm: () =>
                      cancel.mutate(payment.id, {
                        onError: error =>
                          showError(error, 'Nu am putut anula plata.'),
                      }),
                  })
                }
              />
            </View>
          ) : null}
        </Card>
      ))}
      {query.hasNextPage ? (
        <AppButton
          label="Mai multe plăți"
          disabled={query.isFetchingNextPage}
          onPress={() => query.fetchNextPage()}
        />
      ) : null}
      {creating || editing ? (
        <BookingPaymentForm
          eventId={eventId}
          payment={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      ) : null}
    </View>
  );
}
