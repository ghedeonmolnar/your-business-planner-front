import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Booking } from '@/features/bookings/types';
import { useBooking } from '@/features/bookings/hooks/useBookings';
import { QueryState } from '@/shared/components/QueryState';
import { plannerStyles } from '@/features/bookings/components/plannerStyles';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { formatCompanyDateTime } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

export function BookingConflictReview({
  bookingId,
  onReload,
}: {
  bookingId: string;
  onReload: (booking: Booking) => void;
}) {
  const query = useBooking(bookingId);
  const booking = query.data;
  return (
    <View style={plannerStyles.content}>
      <Text style={plannerStyles.text}>
        Ciorna ta este păstrată. Compară datele introduse cu versiunea salvată
        de echipă.
      </Text>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {booking ? (
        <>
          <Text style={plannerStyles.text}>
            Versiunea salvată: {bookingStatusLabels[booking.status]} ·{' '}
            {booking.hall_name}
          </Text>
          <Text style={plannerStyles.text}>
            {formatCompanyDateTime(booking.starts_at)} –{' '}
            {formatCompanyDateTime(booking.ends_at)}
          </Text>
          <Text style={plannerStyles.text}>
            Preț meniu: {formatExactMoney(booking.menu_price)} ·{' '}
            {booking.minimum_guests} invitați
          </Text>
          <Text style={plannerStyles.text}>
            {booking.notes || 'Fără observații'}
          </Text>
          <AppButton
            label="Reîncarcă datele salvate"
            variant="outline"
            onPress={() =>
              confirmAction({
                title: 'Înlocuiești ciorna?',
                message:
                  'Modificările tale nesalvate vor fi înlocuite cu versiunea salvată de echipă.',
                confirmLabel: 'Reîncarcă',
                onConfirm: () => onReload(booking),
              })
            }
          />
        </>
      ) : null}
    </View>
  );
}
