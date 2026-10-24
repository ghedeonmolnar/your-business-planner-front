import { PaginationFooter } from '@/shared/components/PaginationFooter';
import React, { useState } from 'react';
import { View } from 'react-native';
import { RecordCard } from '@/shared/components/RecordCard';
import { MetaPill } from '@/shared/components/MetaPill';
import { InfoRow } from '@/shared/components/InfoRow';
import { bookingPaymentCategories } from '@/features/bookings/utils/bookingLabels';
import { BookingPaymentForm } from '@/features/bookings/components/BookingPaymentForm';
import { BookingPayment } from '@/features/bookings/schemas/bookingFinanceSchemas';
import {
  useBookingPayments,
  useCancelBookingPayment,
} from '@/features/bookings/hooks/useBookingFinance';
import { QueryState } from '@/shared/components/QueryState';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { formatExactMoney } from '@/shared/utils/money';
import { formatLongDate } from '@/shared/utils/formatDate';

const paymentMethodLabels = {
  cash: 'Numerar',
  card: 'Card',
  transfer: 'Transfer bancar',
};

export function BookingPayments({ eventId }: { eventId: string }) {
  const query = useBookingPayments(eventId);
  const cancel = useCancelBookingPayment(eventId);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BookingPayment | null>(null);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <View style={styles.content}>
      <AppButton
        label="Adaugă încasare sau cheltuială"
        multiline
        onPress={() => setCreating(true)}
      />
      <QueryState
        loading={query.isLoading}
        hasData={items.length > 0}
        error={query.isFetchNextPageError ? undefined : query.error}
        empty={!items.length}
        retry={() => query.refetch()}
      />
      {items.map(payment => (
        <RecordCard
          key={payment.id}
          title={`${payment.type === 'incoming' ? 'Încasare' : 'Cheltuială'} · ${formatExactMoney(payment.amount)}`}
          subtitle={formatLongDate(payment.paid_at)}
          badge={
            <MetaPill
              label={
                payment.status === 'completed'
                  ? 'Efectuată'
                  : payment.status === 'cancelled'
                    ? 'Anulată'
                    : 'În așteptare'
              }
              tone={
                payment.status === 'completed'
                  ? 'success'
                  : payment.status === 'cancelled'
                    ? 'danger'
                    : 'warning'
              }
            />
          }
        >
          <InfoRow
            label="Categorie"
            value={
              bookingPaymentCategories[payment.type].find(
                category => category.id === payment.category,
              )?.name ?? payment.category
            }
          />
          <InfoRow
            label="Metodă"
            value={
              payment.method
                ? paymentMethodLabels[payment.method]
                : 'Necompletată'
            }
          />
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
                loading={cancel.isPending}
                onPress={() =>
                  confirmAction({
                    title: 'Anulezi plata?',
                    message:
                      'Înregistrarea rămâne în istoric și nu mai intră în sold.',
                    confirmLabel: 'Anulează plata',
                    onConfirm: () =>
                      cancel.mutate(
                        { id: payment.id, version: payment.version },
                        {
                          onError: error =>
                            showError(error, 'Nu am putut anula plata.'),
                        },
                      ),
                  })
                }
              />
            </View>
          ) : null}
        </RecordCard>
      ))}
      <PaginationFooter
        hasMore={Boolean(query.hasNextPage)}
        loading={query.isFetchingNextPage}
        error={query.isFetchNextPageError ? query.error : undefined}
        onLoadMore={() => query.fetchNextPage()}
        label="Mai multe plăți"
      />
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
